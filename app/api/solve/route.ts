import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  buildFollowUpPrompt,
  buildPrompt,
  buildReadOnlyPrompt,
  buildTextPrompt,
} from "@/lib/prompt";
import { ApiResponse, Grade, Verbosity, SolutionResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 7 * 1024 * 1024; // Gemini inline limit safety margin
const MAX_QUESTION_LENGTH = 2000;

const VALID_GRADES: Grade[] = ["junior", "high", "university", "other"];
const VALID_VERBOSITIES: Verbosity[] = ["brief", "standard", "detailed"];

type Mode = "read" | "full" | "text" | "followup";

function bad(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return bad("サーバー設定エラー: APIキーが未設定です", 500);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return bad("リクエストの読み取りに失敗しました");
  }

  const image = formData.get("image");
  const question = formData.get("question") as string | null;
  const grade = formData.get("grade") as string | null;
  const verbosity = formData.get("verbosity") as string | null;
  const modeParam = formData.get("mode") as string | null;
  const contextRaw = formData.get("context") as string | null;
  const historyRaw = formData.get("history") as string | null;

  // モード判定
  let mode: Mode;
  if (modeParam === "followup") {
    mode = "followup";
  } else if (question && question.trim().length > 0) {
    mode = "text";
  } else if (modeParam === "read") {
    mode = "read";
  } else {
    mode = "full";
  }

  // 入力バリデーション（モード別）
  if (mode === "followup") {
    if (!question || question.trim().length === 0) {
      return bad("追加質問が空です");
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return bad(`質問が長すぎます（${MAX_QUESTION_LENGTH}文字以内）`);
    }
    if (!grade || !VALID_GRADES.includes(grade as Grade)) return bad("学年指定が不正です");
    if (!verbosity || !VALID_VERBOSITIES.includes(verbosity as Verbosity)) {
      return bad("詳しさ指定が不正です");
    }
  } else if (mode === "text") {
    if (!question || question.trim().length === 0) {
      return bad("質問が空です");
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return bad(`質問が長すぎます（${MAX_QUESTION_LENGTH}文字以内）`);
    }
    if (!grade || !VALID_GRADES.includes(grade as Grade)) return bad("学年指定が不正です");
    if (!verbosity || !VALID_VERBOSITIES.includes(verbosity as Verbosity)) {
      return bad("詳しさ指定が不正です");
    }
  } else {
    if (!(image instanceof File)) return bad("画像が含まれていません");
    if (image.size === 0) return bad("画像が空です");
    if (image.size > MAX_IMAGE_BYTES) {
      return bad(`画像サイズが大きすぎます（${(image.size / 1024 / 1024).toFixed(1)}MB / 上限7MB）`);
    }
    if (mode === "full") {
      if (!grade || !VALID_GRADES.includes(grade as Grade)) return bad("学年指定が不正です");
      if (!verbosity || !VALID_VERBOSITIES.includes(verbosity as Verbosity)) {
        return bad("詳しさ指定が不正です");
      }
    }
  }

  // 画像をbase64化（text/followupモードはスキップ）
  let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;
  if (mode !== "text" && mode !== "followup" && image instanceof File) {
    try {
      const buf = Buffer.from(await image.arrayBuffer());
      imagePart = {
        inlineData: {
          mimeType: image.type || "image/jpeg",
          data: buf.toString("base64"),
        },
      };
    } catch {
      return bad("画像の処理に失敗しました", 500);
    }
  }

  // プロンプト選択
  let prompt: string;
  if (mode === "read") {
    prompt = buildReadOnlyPrompt();
  } else if (mode === "text") {
    prompt = buildTextPrompt(
      question!.trim(),
      grade as Grade,
      verbosity as Verbosity
    );
  } else if (mode === "followup") {
    // 元の解説を文字列化
    let contextStr = "";
    try {
      const parsedCtx = contextRaw ? JSON.parse(contextRaw) : null;
      if (Array.isArray(parsedCtx)) {
        contextStr = parsedCtx
          .map((p: SolutionResult, i: number) => {
            const heading = parsedCtx.length > 1 ? `### 問題${i + 1}\n` : "";
            return `${heading}問題: ${p.problemReading}\n考え方: ${p.approach}\n解き方: ${p.steps}\n答え: ${p.answer}`;
          })
          .join("\n\n");
      }
    } catch {
      contextStr = "";
    }
    let chatHistory: Array<{ role: string; content: string }> = [];
    try {
      const parsedHist = historyRaw ? JSON.parse(historyRaw) : null;
      if (Array.isArray(parsedHist)) {
        chatHistory = parsedHist
          .filter((m) => m && typeof m.role === "string" && typeof m.content === "string")
          .map((m) => ({ role: String(m.role), content: String(m.content) }))
          .slice(-10); // 直近10件まで
      }
    } catch {
      chatHistory = [];
    }
    prompt = buildFollowUpPrompt(
      contextStr,
      chatHistory,
      question!.trim(),
      grade as Grade,
      verbosity as Verbosity
    );
  } else {
    prompt = buildPrompt(grade as Grade, verbosity as Verbosity);
  }

  const ai = new GoogleGenAI({ apiKey });

  // 503 (UNAVAILABLE) と 429 (RESOURCE_EXHAUSTED) は一時的な混雑なのでリトライ
  const RETRYABLE_PATTERNS = [
    "UNAVAILABLE",
    "RESOURCE_EXHAUSTED",
    "DEADLINE_EXCEEDED",
    "503",
    "429",
    "504",
  ];
  const MAX_RETRIES = 2;
  const BACKOFF_MS = [1500, 4000]; // 1.5s, 4s

  // contentsを動的に組み立て（テキストモードでは画像なし）
  const contents = imagePart
    ? [imagePart, { text: prompt }]
    : [{ text: prompt }];

  let rawText = "";
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      rawText = response.text ?? "";
      lastError = null;
      break;
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isRetryable = RETRYABLE_PATTERNS.some((p) => msg.includes(p));
      if (!isRetryable || attempt === MAX_RETRIES) break;
      await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt] ?? 4000));
    }
  }

  if (lastError) {
    const msg = lastError instanceof Error ? lastError.message : "不明なエラー";
    if (RETRYABLE_PATTERNS.some((p) => msg.includes(p))) {
      return bad(
        "AIが現在混雑しています。1〜2分後にもう一度お試しください。",
        503
      );
    }
    if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
      return bad("AIへのアクセスが拒否されました（管理者にご連絡ください）", 502);
    }
    if (msg.includes("INVALID_ARGUMENT") || msg.includes("400")) {
      return bad("入力をAIが処理できませんでした。内容を変えてお試しください。", 400);
    }
    return bad(`AI呼び出しに失敗しました: ${msg}`, 502);
  }

  if (!rawText.trim()) return bad("AIから応答が得られませんでした", 502);

  let parsed: SolutionResult[];
  try {
    const obj = JSON.parse(rawText);
    const arr = Array.isArray(obj?.problems) ? obj.problems : null;
    if (!arr || arr.length === 0) {
      return bad("AI応答が想定外の形式でした", 502);
    }
    parsed = arr.map((p: unknown) => {
      const o = (p ?? {}) as Record<string, unknown>;
      const diagram = typeof o.diagram === "string" ? o.diagram.trim() : "";
      return {
        problemReading: String(o.problemReading ?? ""),
        approach: String(o.approach ?? ""),
        steps: String(o.steps ?? ""),
        answer: String(o.answer ?? ""),
        ...(diagram ? { diagram } : {}),
      };
    });
  } catch {
    return bad("AI応答の解析に失敗しました（JSON形式エラー）", 502);
  }

  return NextResponse.json({ ok: true, data: parsed });
}
