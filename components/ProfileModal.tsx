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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white shadow-xl w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="p-6">
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
                    className={`min-h-12 px-3 py-2.5 rounded-lg border-2 text-base transition active:scale-[0.98] ${
                      grade === g
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 active:border-indigo-400"
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
                    className={`min-h-12 px-2 py-2.5 rounded-lg border-2 text-base transition active:scale-[0.98] ${
                      verbosity === v
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 active:border-indigo-400"
                    }`}
                  >
                    {VERBOSITY_LABEL[v]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 flex gap-3 justify-end">
            {!isFirstTime && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 px-5 py-2.5 rounded-lg text-slate-600 active:bg-slate-100 transition"
              >
                キャンセル
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none min-h-12 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold active:bg-indigo-700 transition"
            >
              {isFirstTime ? "はじめる" : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
