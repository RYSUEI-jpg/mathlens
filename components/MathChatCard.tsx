"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, Grade } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  grade: Grade;
}

const SAMPLE_QUESTIONS = [
  "0で割っちゃダメな理由って？",
  "数学が苦手な人にコツある？",
  "なんで数学を勉強するの？",
  "πは何桁まで覚える価値ある？",
];

export function MathChatCard({ grade }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const trimmed = text.trim();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, streaming]);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: question,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setBusy(true);
    setStreaming("");
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const fd = new FormData();
      fd.append("kind", "chat");
      fd.append("question", question);
      fd.append("history", JSON.stringify(history));
      fd.append("grade", grade);
      const res = await fetch("/api/explore", { method: "POST", body: fd });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      acc += decoder.decode();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: acc.trim() || "（応答が空でした）",
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "エラー: " + (e instanceof Error ? e.message : ""),
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
      setStreaming("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      send(trimmed);
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-2xl p-4">
      <div className="text-xs font-bold text-emerald-700 mb-1">💬 数学雑談</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        AIに数学のこと、なんでも聞いてみよう
      </h3>
      <p className="text-xs text-slate-600 mb-3">
        問題じゃなくて、素朴な疑問でもOK
      </p>

      {messages.length === 0 && !busy && (
        <div className="space-y-2 mb-3">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="w-full text-left bg-white border border-emerald-100 rounded-lg p-3 text-sm text-slate-700 active:bg-emerald-50 transition"
            >
              💭 {q}
            </button>
          ))}
        </div>
      )}

      {(messages.length > 0 || busy) && (
        <div className="bg-white rounded-xl border border-emerald-100 mb-3 max-h-80 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-2.5 ${
                m.role === "user" ? "bg-emerald-50 ml-6" : "bg-slate-50 mr-6"
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 mb-1">
                {m.role === "user" ? "あなた" : "🤖 AI"}
              </div>
              {m.role === "assistant" ? (
                <MathRenderer>{m.content}</MathRenderer>
              ) : (
                <div className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                  {m.content}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div ref={bottomRef} className="bg-slate-50 mr-6 rounded-xl p-2.5">
              <div className="text-[10px] font-bold text-slate-500 mb-1">🤖 AI</div>
              {streaming ? (
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {streaming}
                  <span className="inline-block w-1.5 h-4 bg-emerald-500 animate-pulse align-middle ml-0.5 rounded-sm" />
                </div>
              ) : (
                <div className="flex gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="数学について質問してみよう"
          className="w-full min-h-14 max-h-32 p-2.5 rounded-lg border-2 border-slate-200 focus:border-emerald-400 focus:outline-none resize-y text-base bg-white"
          rows={2}
          disabled={busy}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => send(trimmed)}
            disabled={!trimmed || busy}
            className="min-h-10 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium active:bg-emerald-700 disabled:opacity-40"
          >
            {busy ? "応答中..." : "送信 ↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
