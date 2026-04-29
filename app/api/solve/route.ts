import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "@/lib/prompt";
import { ApiResponse, Grade, Verbosity, SolutionResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 7 * 1024 * 1024; // Gemini inline limit safety margin

const VALID_GRADES: Grade[] = ["junior", "high", "university", "other"];
const VALID_VERBOSITIES: Verbosity[] = ["brief", "standard", "detailed"];

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
  const grade = formData.get("grade") as string | null;
  const verbosity = formData.get("verbosity") as string | null;

  if (!(image instanceof File)) return bad("画像が含まれていません");
  if (image.size === 0) return bad("画像が空です");
  if (image.size > MAX_IMAGE_BYTES) {
    return bad(`画像サイズが大きすぎます（${(image.size / 1024 / 1024).toFixed(1)}MB / 上限7MB）`);
  }
  if (!grade || !VALID_GRADES.includes(grade as Grade)) return bad("学年指定が不正です");
  if (!verbosity || !VALID_VERBOSITIES.includes(verbosity as Verbosity)) {
    return bad("詳しさ指定が不正です");
  }

  let base64: string;
  let mimeType: string;
  try {
    const buf = Buffer.from(await image.arrayBuffer());
    base64 = buf.toString("base64");
    mimeType = image.type || "image/jpeg";
  } catch {
    return bad("画像の処理に失敗しました", 500);
  }

  const prompt = buildPrompt(grade as Grade, verbosity as Verbosity);
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

  let rawText = "";
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt },
        ],
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
      return bad("画像をAIが処理できませんでした。別の画像でお試しください。", 400);
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
