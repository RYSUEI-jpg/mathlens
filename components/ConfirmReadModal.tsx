"use client";

import { useState } from "react";
import { SolutionResult } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  problems: SolutionResult[];
  onConfirm: (skipNext: boolean) => void;
  onRetake: () => void;
}

export function ConfirmReadModal({ problems, onConfirm, onRetake }: Props) {
  const [skipNext, setSkipNext] = useState(false);
  const multi = problems.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div
        className="bg-white shadow-xl w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl flex flex-col"
        style={{
          maxHeight: "calc(100vh - env(safe-area-inset-top, 0px))",
        }}
      >
        <div className="p-5 sm:p-6 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            🔍 {multi ? `${problems.length}個の問題を見つけました` : "問題はこれで合ってる？"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {multi
              ? "AIが画像から読み取った内容です。間違っていたら撮り直してください。"
              : "AIが画像から読み取った内容です。間違っていたら撮り直してね。"}
          </p>
        </div>

        <div className="px-5 sm:px-6 py-3 overflow-y-auto flex-1 border-y border-slate-100 bg-slate-50 space-y-3 min-h-32">
          {problems.map((p, i) => (
            <div
              key={i}
              className={multi ? "bg-white rounded-lg p-3 border border-slate-200" : ""}
            >
              {multi && (
                <div className="text-xs font-bold text-indigo-600 mb-1">
                  問題 {i + 1}
                </div>
              )}
              <MathRenderer>{p.problemReading}</MathRenderer>
            </div>
          ))}
        </div>

        <div
          className="p-5 sm:p-6 pt-4 space-y-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
        >
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer min-h-10 select-none">
            <input
              type="checkbox"
              checked={skipNext}
              onChange={(e) => setSkipNext(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600"
            />
            次回からこの確認を表示しない
          </label>

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="flex-1 min-h-12 px-4 py-3 rounded-lg text-slate-700 bg-slate-100 active:bg-slate-200 transition font-medium"
            >
              撮り直す
            </button>
            <button
              type="button"
              onClick={() => onConfirm(skipNext)}
              className="flex-[2] min-h-12 px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold active:bg-indigo-700 transition"
            >
              {multi ? "解説を見る" : "合ってる！解説する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
