"use client";

import { useState } from "react";
import { Grade, Verbosity, UserSettings, GRADE_LABEL, VERBOSITY_LABEL } from "@/lib/types";

interface Props {
  initial: UserSettings;
  isFirstTime: boolean;
  onSave: (settings: UserSettings) => void;
  onClose?: () => void;
}

const GRADES: Grade[] = ["junior", "high", "university", "other"];
const VERBOSITIES: Verbosity[] = ["brief", "standard", "detailed"];

export function ProfileModal({ initial, isFirstTime, onSave, onClose }: Props) {
  const [grade, setGrade] = useState<Grade>(initial.grade);
  const [verbosity, setVerbosity] = useState<Verbosity>(initial.verbosity);

  function handleSave() {
    onSave({
      ...initial,
      grade,
      verbosity,
      isProfileSet: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {isFirstTime ? "👋 はじめまして！" : "⚙️ 設定"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isFirstTime
            ? "あなたに合わせた解説をするので、教えてください"
            : "解説のスタイルを変更できます"}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">学年</label>
            <div className="grid grid-cols-2 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    grade === g
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
                  }`}
                >
                  {GRADE_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">解説の詳しさ</label>
            <div className="grid grid-cols-3 gap-2">
              {VERBOSITIES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVerbosity(v)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    verbosity === v
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
                  }`}
                >
                  {VERBOSITY_LABEL[v]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          {!isFirstTime && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              キャンセル
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            {isFirstTime ? "はじめる" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
