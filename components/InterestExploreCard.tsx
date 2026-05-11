"use client";

import { useState } from "react";
import { INTERESTS, InterestSeed } from "@/lib/discover";
import { Grade } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  grade: Grade;
}

export function InterestExploreCard({ grade }: Props) {
  const [selected, setSelected] = useState<InterestSeed | null>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function explore(interest: InterestSeed) {
    setSelected(interest);
    setContent("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", "interest");
      fd.append("interest", interest.label);
      fd.append("grade", grade);
      const res = await fetch("/api/explore", { method: "POST", body: fd });
      if (!res.ok || !res.body) {
        setContent("読み込みに失敗しました。");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setContent(acc);
      }
      acc += decoder.decode();
      setContent(acc);
    } catch (e) {
      setContent("エラー: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-violet-50 border border-sky-100 rounded-2xl p-4">
      <div className="text-xs font-bold text-sky-700 mb-1">🌟 興味から数学へ</div>
      <h3 className="text-base font-bold text-slate-900 mb-3">
        好きな分野を選ぶと、そこに潜む数学が見える
      </h3>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((i) => {
          const active = selected?.id === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => explore(i)}
              disabled={busy}
              className={`min-h-10 px-3 py-2 rounded-full text-sm border-2 transition active:scale-[0.97] ${
                active
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-700 border-slate-200 active:border-sky-400 disabled:opacity-50"
              }`}
            >
              {i.emoji} {i.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 bg-white rounded-xl p-3 border border-sky-100">
          <div className="text-xs font-bold text-sky-700 mb-2">
            {selected.emoji} {selected.label}と数学
          </div>
          {busy && !content && (
            <div className="flex gap-1 text-sky-400 py-2">
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          {content && (
            busy ? (
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {content}
                <span className="inline-block w-1.5 h-4 bg-sky-500 animate-pulse align-middle ml-0.5 rounded-sm" />
              </div>
            ) : (
              <>
                <MathRenderer>{content}</MathRenderer>
                <button
                  type="button"
                  onClick={() => explore(selected)}
                  className="mt-3 min-h-10 px-3 py-2 rounded-lg text-sm bg-sky-50 text-sky-700 active:bg-sky-100 font-medium"
                >
                  🔄 同じ分野でもう一個
                </button>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
