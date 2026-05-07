"use client";

import { useState } from "react";

interface Props {
  onSubmit: (question: string) => void;
}

const EXAMPLES = [
  "x² + 3x + 2 = 0 を解いて",
  "微分について教えて",
  "三角関数の加法定理を例つきで",
  "正弦定理と余弦定理の使い分け",
];

const MAX_LENGTH = 2000;

export function TextQuestionInput({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const remaining = MAX_LENGTH - text.length;

  function handleSubmit() {
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter で送信
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          placeholder="解きたい問題、または知りたい概念を入力してください..."
          className="w-full min-h-32 max-h-64 p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none resize-y text-base"
          rows={4}
        />
        <div className="text-right text-xs text-slate-400 mt-1">
          {remaining}文字
        </div>
      </div>

      {!trimmed && (
        <div>
          <div className="text-xs text-slate-500 mb-2">💡 こんな質問ができます</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!trimmed}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
      >
        🚀 質問する
      </button>
      <p className="text-xs text-slate-400 text-center">
        Ctrl/⌘ + Enter で送信
      </p>
    </div>
  );
}
