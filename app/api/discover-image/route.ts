import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildDiscoverImagePrompt } from "@/lib/prompt";
import { ApiResponse, Grade, SolutionResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
const VALID_GRADES: Grade[] = ["junior", "high", "university", "other"];

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

  if (!(image instanceof File)) return bad("画像が含まれていません");
  if (image.size === 0) return bad("画像が空です");
  if (image.size > MAX_IMAGE_BYTES) {
    return bad(`画像サイズが大きすぎます（${(image.size / 1024 / 1024).toFixed(1)}MB / 上限7MB）`);
  }
  if (!grade || !VALID_GRADES.includes(grade as Grade)) return bad("学年指定が不正です");

  let base64: string;
  let mimeType: string;
  try {
    const buf = Buffer.from(await image.arrayBuffer());
    base64 = buf.toString("base64");
    mimeType = image.type || "image/jpeg";
  } catch {
    return bad("画像の処理に失敗しました", 500);
  }

  const prompt = buildDiscoverImagePrompt(grade as Grade);
  const ai = new GoogleGenAI({ apiKey });

  const RETRYABLE = ["UNAVAILABLE", "RESOURCE_EXHAUSTED", "503", "429", "504"];
  const BACKOFF = [1500, 4000];
  let rawText = "";
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      rawText = response.text ?? "";
      lastError = null;
      break;
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isRetryable = RETRYABLE.some((p) => msg.includes(p));
      if (!isRetryable || attempt === 2) break;
      await new Promise((r) => setTimeout(r, BACKOFF[attempt] ?? 4000));
    }
  }

  if (lastError) {
    const msg = lastError instanceof Error ? lastError.message : "不明なエラー";
    if (RETRYABLE.some((p) => msg.includes(p))) {
      return bad("AIが混雑しています。1〜2分後にもう一度お試しください。", 503);
    }
    if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
      return bad("AIへのアクセスが拒否されました", 502);
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
    return bad("AI応答の解析に失敗しました", 502);
  }

  return NextResponse.json({ ok: true, data: parsed });
}
