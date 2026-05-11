import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  buildDailyTopicPrompt,
  buildInterestExplorePrompt,
  buildMathChatPrompt,
} from "@/lib/prompt";
import { Grade } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_GRADES: Grade[] = ["junior", "high", "university", "other"];
const MAX_LENGTH = 2000;

function badText(message: string, status = 400): Response {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

type Kind = "daily" | "interest" | "chat";

export async function POST(req: NextRequest): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return badText("サーバー設定エラー: APIキーが未設定です", 500);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return badText("リクエストの読み取りに失敗しました");
  }

  const kindParam = formData.get("kind") as string | null;
  const grade = formData.get("grade") as string | null;
  const title = (formData.get("title") as string | null) ?? "";
  const hook = (formData.get("hook") as string | null) ?? "";
  const interest = (formData.get("interest") as string | null) ?? "";
  const question = (formData.get("question") as string | null) ?? "";
  const historyRaw = formData.get("history") as string | null;

  if (kindParam !== "daily" && kindParam !== "interest" && kindParam !== "chat") {
    return badText("kindが不正です（daily|interest|chat）");
  }
  const kind = kindParam as Kind;

  if (!grade || !VALID_GRADES.includes(grade as Grade)) return badText("学年指定が不正です");

  if (kind === "daily" && (!title.trim() || title.length > MAX_LENGTH)) {
    return badText("titleが不正です");
  }
  if (kind === "interest" && (!interest.trim() || interest.length > 100)) {
    return badText("interestが不正です");
  }
  if (kind === "chat" && (!question.trim() || question.length > MAX_LENGTH)) {
    return badText("質問が不正です");
  }

  let chatHistory: Array<{ role: string; content: string }> = [];
  if (kind === "chat" && historyRaw) {
    try {
      const parsed = JSON.parse(historyRaw);
      if (Array.isArray(parsed)) {
        chatHistory = parsed
          .filter(
            (m) => m && typeof m.role === "string" && typeof m.content === "string"
          )
          .map((m) => ({ role: String(m.role), content: String(m.content) }))
          .slice(-10);
      }
    } catch {
      chatHistory = [];
    }
  }

  let prompt: string;
  if (kind === "daily") {
    prompt = buildDailyTopicPrompt(title.trim(), hook.trim(), grade as Grade);
  } else if (kind === "interest") {
    prompt = buildInterestExplorePrompt(interest.trim(), grade as Grade);
  } else {
    prompt = buildMathChatPrompt(question.trim(), chatHistory, grade as Grade);
  }

  const ai = new GoogleGenAI({ apiKey });
  let geminiStream;
  try {
    geminiStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: [{ text: prompt }],
      config: { temperature: kind === "chat" ? 0.5 : 0.7 },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
      return badText("AIへのアクセスが拒否されました", 502);
    }
    if (msg.includes("UNAVAILABLE") || msg.includes("503") || msg.includes("429")) {
      return badText("AIが混雑しています。少し待って再試行してね。", 503);
    }
    return badText(`AI呼び出しに失敗しました: ${msg}`, 502);
  }

  const encoder = new TextEncoder();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of geminiStream) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "ストリーム中断";
        controller.enqueue(encoder.encode(`\n\n[エラー: ${errMsg}]`));
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
