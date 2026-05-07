"use client";

import { useEffect, useState } from "react";

const KEY = "mathlens.onboarding.v1";

interface SeenHints {
  intro: boolean;
}

function loadSeen(): SeenHints {
  if (typeof window === "undefined") return { intro: false };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...{ intro: false }, ...JSON.parse(raw) } : { intro: false };
  } catch {
    return { intro: false };
  }
}

function saveSeen(s: SeenHints) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

interface Props {
  /** プロフィール設定が完了した直後に true（このとき初回ヒントを出す） */
  enabled: boolean;
}

const HINTS = [
  { emoji: "📷", title: "カメラで撮影", desc: "数学の問題の写真を撮るとAIが解説します" },
  { emoji: "📋", title: "貼り付け対応", desc: "Ctrl/⌘+Vでスクショを貼り付けることもできます" },
  { emoji: "✏️", title: "テキストで質問", desc: "「微分について教えて」など概念質問も可能" },
  { emoji: "💬", title: "追加質問", desc: "解説の下からチャットで追加質問できます" },
  { emoji: "📚", title: "履歴・統計", desc: "右上の時計アイコンから過去の問題と学習統計を見れます" },
];

export function OnboardingHints({ enabled }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const seen = loadSeen();
    if (!seen.intro) {
      setOpen(true);
    }
  }, [enabled]);

  function handleClose() {
    saveSeen({ intro: true });
    setOpen(false);
    setStep(0);
  }

  function handleNext() {
    if (step < HINTS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  if (!open) return null;
  const hint = HINTS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
      >
        <div className="text-center">
          <div className="text-6xl mb-3">{hint.emoji}</div>
          <h3 className="text-xl font-bold text-slate-900">{hint.title}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{hint.desc}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {HINTS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 min-h-12 px-4 py-3 rounded-lg text-slate-600 active:bg-slate-100 transition text-sm"
          >
            スキップ
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-[2] min-h-12 px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold active:bg-indigo-700 transition"
          >
            {step < HINTS.length - 1 ? "次へ →" : "始める！"}
          </button>
        </div>
      </div>
    </div>
  );
}
