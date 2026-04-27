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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1 text-sm">{message}</div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
