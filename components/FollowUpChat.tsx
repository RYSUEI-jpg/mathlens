"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  messages: ChatMessage[];
  onSend: (question: string) => Promise<string>;
}

export function FollowUpChat({ messages, onSend }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);
  const trimmed = text.trim();

  // page側のmessagesと同期
  if (messages !== localMessages && messages.length !== localMessages.length) {
    setLocalMessages(messages);
  }

  async function handleSend() {
    if (!trimmed || busy) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setText("");
    setBusy(true);
    try {
      const answer = await onSend(trimmed);
      setLocalMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, timestamp: Date.now() },
      ]);
    } catch (e) {
      setLocalMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "回答の取得に失敗しました: " +
            (e instanceof Error ? e.message : "通信エラー"),
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-indigo-50/50">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          💬 ここがわからない時に聞いてね
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          上の解説について追加で質問できます
        </p>
      </div>

      {localMessages.length > 0 && (
        <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
          {localMessages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 ${
                m.role === "user"
                  ? "bg-indigo-50 ml-6"
                  : "bg-slate-50 mr-6"
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
            <div className="bg-slate-50 mr-6 rounded-xl p-3 text-sm text-slate-500 animate-pulse">
              🤖 考え中...
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-slate-50/50 border-t border-slate-100 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: ステップ②がよくわからない / 別の解き方も教えて / なぜ移項するの？"
          className="w-full min-h-16 max-h-40 p-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-400 focus:outline-none resize-y text-base leading-relaxed bg-white"
          rows={2}
          disabled={busy}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={!trimmed || busy}
            className="min-h-10 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {busy ? "送信中..." : "送信 ↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
