"use client";

import { UserSettings, GRADE_LABEL, VERBOSITY_LABEL } from "@/lib/types";

interface Props {
  settings: UserSettings;
  onEdit: () => void;
}

export function SettingsBar({ settings, onEdit }: Props) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition-colors flex items-center justify-between"
    >
      <span className="text-sm text-slate-700">
        <span className="text-slate-500">学年:</span>{" "}
        <span className="font-medium">{GRADE_LABEL[settings.grade]}</span>
        <span className="text-slate-500 ml-3">詳しさ:</span>{" "}
        <span className="font-medium">{VERBOSITY_LABEL[settings.verbosity]}</span>
      </span>
      <span className="text-xs text-indigo-600">変更</span>
    </button>
  );
}
