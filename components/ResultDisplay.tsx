"use client";

import { forwardRef } from "react";
import { SolutionResult } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  result: SolutionResult;
}

interface SectionProps {
  emoji: string;
  title: string;
  body: string;
  tone?: "default" | "answer";
}

function Section({ emoji, title, body, tone = "default" }: SectionProps) {
  if (!body.trim()) return null;
  const toneClass =
    tone === "answer"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-white border-slate-200";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
        <span>{emoji}</span>
        <span>{title}</span>
      </h3>
      <MathRenderer>{body}</MathRenderer>
    </div>
  );
}

export const ResultDisplay = forwardRef<HTMLDivElement, Props>(
  function ResultDisplay({ result }, ref) {
    return (
      <div ref={ref} className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <Section emoji="📖" title="読み取った問題" body={result.problemReading} />
        <Section emoji="💡" title="考え方" body={result.approach} />
        <Section emoji="✏️" title="解き方" body={result.steps} />
        <Section emoji="✅" title="答え" body={result.answer} tone="answer" />
      </div>
    );
  }
);
