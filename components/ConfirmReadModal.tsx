"use client";

import { useState } from "react";
import { MathRenderer } from "./MathRenderer";

interface Props {
  problemReading: string;
  onConfirm: (skipNext: boolean) => void;
  onRetake: () => void;
}

export function ConfirmReadModal({ problemReading, onConfirm, onRetake }: Props) {
  const [skipNext, setSkipNext] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            🔍 問題はこれで合ってる？
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            AIが画像から読み取った内容です。間違っていたら撮り直してね。
          </p>
        </div>

        <div className="px-6 py-3 overflow-y-auto flex-1 border-y border-slate-100 bg-slate-50">
          <MathRenderer>{problemReading}</MathRenderer>
        </div>

        <div className="p-6 pt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={skipNext}
              onChange={(e) => setSkipNext(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            次回からこの確認を表示しない
          </label>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onRetake}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              撮り直す
            </button>
            <button
              type="button"
              onClick={() => onConfirm(skipNext)}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              この問題で合ってる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
