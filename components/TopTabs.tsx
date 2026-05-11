"use client";

export type AppTab = "solve" | "discover";

interface Props {
  tab: AppTab;
  onChange: (t: AppTab) => void;
}

export function TopTabs({ tab, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="メイン機能"
      className="flex gap-1 p-1 bg-slate-100 rounded-xl"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === "solve"}
        onClick={() => onChange("solve")}
        className={`flex-1 min-h-12 py-2.5 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${
          tab === "solve"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-600 active:bg-slate-200"
        }`}
      >
        🧮 解く
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "discover"}
        onClick={() => onChange("discover")}
        className={`flex-1 min-h-12 py-2.5 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${
          tab === "discover"
            ? "bg-white text-fuchsia-600 shadow-sm"
            : "text-slate-600 active:bg-slate-200"
        }`}
      >
        🔭 探検
      </button>
    </div>
  );
}
