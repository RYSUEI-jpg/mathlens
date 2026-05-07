"use client";

export type InputMode = "image" | "text";

interface Props {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export function InputTabs({ mode, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="入力方法"
      className="flex gap-1 p-1 bg-slate-100 rounded-xl"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "image"}
        onClick={() => onChange("image")}
        className={`flex-1 min-h-12 py-2.5 rounded-lg text-sm font-medium transition active:scale-[0.98] ${
          mode === "image"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 active:bg-slate-200"
        }`}
      >
        📷 画像で入力
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "text"}
        onClick={() => onChange("text")}
        className={`flex-1 min-h-12 py-2.5 rounded-lg text-sm font-medium transition active:scale-[0.98] ${
          mode === "text"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 active:bg-slate-200"
        }`}
      >
        ✏️ テキストで質問
      </button>
    </div>
  );
}
