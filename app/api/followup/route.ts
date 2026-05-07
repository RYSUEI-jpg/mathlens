import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildFollowUpPrompt } from "@/lib/prompt";
import { Grade, SolutionResult, Verbosity } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_GRADES: Grade[] = ["junior", "high", "university", "other"];
const VALID_VERBOSITIES: Verbosity[] = ["brief", "standard", "detailed"];
const MAX_QUESTION_LENGTH = 2000;

function badText(message: string, status = 400): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function POST(req: NextRequest): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return badText("サーバー設定エラー: APIキーが未設定です", 500);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return badText("リクエストの読み取りに失敗しました");
  }

  const question = formData.get("question") as string | null;
  const grade = formData.get("grade") as string | null;
  const verbosity = formData.get("verbosity") as string | null;
  const contextRaw = formData.get("context") as string | null;
  const historyRaw = formData.get("history") as string | null;

  if (!question || question.trim().length === 0) return badText("質問が空です");
  if (question.length > MAX_QUESTION_LENGTH) {
    return badText(`質問が長すぎます（${MAX_QUESTION_LENGTH}文字以内）`);
  }
  if (!grade || !VALID_GRADES.includes(grade as Grade)) return badText("学年指定が不正です");
  if (!verbosity || !VALID_VERBOSITIES.includes(verbosity as Verbosity)) {
    return badText("詳しさ指定が不正です");
  }

  // コンテキスト整形
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
        .slice(-10);
    }
  } catch {
    chatHistory = [];
  }

  const prompt = buildFollowUpPrompt(
    contextStr,
    chatHistory,
    question.trim(),
    grade as Grade,
    verbosity as Verbosity
  );

  const ai = new GoogleGenAI({ apiKey });

  // ストリーミング応答（軽量モデルで高速化）
  let geminiStream;
  try {
    geminiStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: [{ text: prompt }],
      config: { temperature: 0.3 },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
      return badText("AIへのアクセスが拒否されました", 502);
    }
    return badText(`AI呼び出しに失敗しました: ${msg}`, 502);
  }

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of geminiStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "ストリーム中断";
        controller.enqueue(
          encoder.encode(`\n\n[エラー: ${errMsg}]`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
