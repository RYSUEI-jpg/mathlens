"use client";

interface Props {
  src: string;
  onReset: () => void;
}

export function ImagePreview({ src, onReset }: Props) {
  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="読み込んだ問題"
          className="w-full max-h-80 object-contain"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="min-h-10 px-3 -ml-1 text-sm text-slate-600 active:text-indigo-700 active:bg-slate-100 rounded-lg transition"
      >
        ↩ 画像を選び直す
      </button>
    </div>
  );
}
