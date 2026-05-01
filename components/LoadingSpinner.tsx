"use client";

import { useEffect, useState } from "react";

const DEFAULT_STAGES = [
  "📷 画像を読み込んでいます...",
  "🔍 問題を認識しています...",
  "🧠 解説を考えています...",
  "✏️ もう少しで完成です...",
];

interface Props {
  /** 固定メッセージ。指定するとstages循環せずこれだけ表示 */
  message?: string;
  /** 一定間隔で順送りされるステージメッセージ */
  stages?: string[];
}

export function LoadingSpinner({ message, stages }: Props) {
  const [idx, setIdx] = useState(0);
  const list = stages ?? DEFAULT_STAGES;

  useEffect(() => {
    if (message) return;
    setIdx(0);
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, list.length - 1));
    }, 2500);
    return () => clearInterval(t);
  }, [message, list]);

  const display = message ?? list[idx];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
      </div>
      <p className="text-slate-600 text-center min-h-[1.5rem] transition-opacity">
        {display}
      </p>
    </div>
  );
}
