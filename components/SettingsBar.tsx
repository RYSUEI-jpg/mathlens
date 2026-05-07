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
      className="w-full text-left px-4 min-h-12 rounded-lg bg-white border border-slate-200 active:bg-slate-50 transition-colors flex items-center justify-between gap-2"
    >
      <span className="text-sm text-slate-700 truncate">
        <span className="text-slate-500">学年:</span>{" "}
        <span className="font-medium">{GRADE_LABEL[settings.grade]}</span>
        <span className="text-slate-500 ml-3">詳しさ:</span>{" "}
        <span className="font-medium">{VERBOSITY_LABEL[settings.verbosity]}</span>
      </span>
      <span className="text-sm text-indigo-600 font-medium flex-shrink-0">変更</span>
    </button>
  );
}
