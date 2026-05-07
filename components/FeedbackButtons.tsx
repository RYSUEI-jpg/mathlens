"use client";

import { FeedbackValue } from "@/lib/types";

interface Props {
  current?: FeedbackValue;
  onSelect: (value: FeedbackValue) => void;
}

const OPTIONS: Array<{ value: FeedbackValue; emoji: string; label: string }> = [
  { value: "good", emoji: "👍", label: "役立った" },
  { value: "wrong", emoji: "🤔", label: "間違ってる気がする" },
  { value: "alternative", emoji: "🔄", label: "別の解き方を見たい" },
];

export function FeedbackButtons({ current, onSelect }: Props) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="text-xs font-medium text-slate-500 mb-2">
        この解説はどうでしたか？
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`min-h-10 px-3 py-2 rounded-lg text-sm border transition active:scale-[0.98] ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 active:border-indigo-400"
              }`}
            >
              <span className="mr-1">{opt.emoji}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {current === "wrong" && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
          フィードバックありがとう。AIの解説は完璧ではないので、教科書や先生にも確認してね。
        </p>
      )}
      {current === "alternative" && (
        <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-2 mt-2">
          下のチャットで「別の解き方で教えて」と質問してみてください。
        </p>
      )}
    </div>
  );
}
