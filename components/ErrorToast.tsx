"use client";

import { useEffect } from "react";

interface Props {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      className="fixed left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-1.5rem)]"
      style={{
        bottom: "calc(96px + max(env(safe-area-inset-bottom), 12px))",
      }}
    >
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-start gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div className="flex-1 text-sm leading-relaxed">{message}</div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="-mr-2 -my-1 w-10 h-10 flex items-center justify-center text-red-400 active:text-red-600 active:bg-red-100 rounded-lg flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
