"use client";

export type InputMode = "image" | "text";

interface Props {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export function InputTabs({ mode, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
      <button
        type="button"
        onClick={() => onChange("image")}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
          mode === "image"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        📷 画像で入力
      </button>
      <button
        type="button"
        onClick={() => onChange("text")}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
          mode === "text"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        ✏️ テキストで質問
      </button>
    </div>
  );
}
