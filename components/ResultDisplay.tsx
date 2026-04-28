"use client";

import { forwardRef, useState } from "react";
import { SolutionResult } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";
import { CopyButton } from "./CopyButton";

interface Props {
  results: SolutionResult[];
  imageSrc?: string | null;
}

interface SectionProps {
  emoji: string;
  title: string;
  body: string;
  tone?: "default" | "answer";
  copyText?: string;
}

function Section({ emoji, title, body, tone = "default", copyText }: SectionProps) {
  if (!body.trim()) return null;
  const toneClass =
    tone === "answer"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-white border-slate-200";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span>{emoji}</span>
          <span>{title}</span>
        </h3>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <MathRenderer>{body}</MathRenderer>
    </div>
  );
}

function PhotoThumbnail({ src }: { src: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-indigo-300 transition text-left"
        aria-label="撮影した画像を拡大表示"
      >
        <div className="flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="撮影した問題"
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 text-xs text-slate-500">
            <div className="font-medium text-slate-700">📸 撮影した画像</div>
            <div className="mt-0.5">タップで拡大</div>
          </div>
        </div>
      </button>
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="撮影した問題（拡大）"
            className="max-w-full max-h-full object-contain"
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 text-white text-3xl"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

function PaginationBar({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={current === 0}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        ← 前の問題
      </button>
      <span className="text-sm font-bold text-indigo-900">
        問題 {current + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={current === total - 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        次の問題 →
      </button>
    </div>
  );
}

export const ResultDisplay = forwardRef<HTMLDivElement, Props>(
  function ResultDisplay({ results, imageSrc }, ref) {
    const [index, setIndex] = useState(0);
    const total = results.length;
    const current = results[Math.min(index, total - 1)];

    return (
      <div ref={ref} className="space-y-3">
        {imageSrc && <PhotoThumbnail src={imageSrc} />}

        {total > 1 && (
          <PaginationBar
            current={index}
            total={total}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(total - 1, i + 1))}
          />
        )}

        <div className="bg-slate-50 rounded-2xl p-3 space-y-3">
          <Section emoji="📖" title="読み取った問題" body={current.problemReading} />
          <Section emoji="💡" title="考え方" body={current.approach} />
          <Section emoji="✏️" title="解き方" body={current.steps} />
          <Section
            emoji="✅"
            title="答え"
            body={current.answer}
            tone="answer"
            copyText={current.answer}
          />
        </div>
      </div>
    );
  }
);
