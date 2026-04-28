"use client";

interface Props {
  imageSrc?: string | null;
  onRetake: () => void;
}

export function UnreadableState({ imageSrc, onRetake }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
      <div className="text-center space-y-3">
        <div className="text-5xl">🤔</div>
        <h2 className="text-lg font-bold text-slate-900">
          問題を読み取れませんでした
        </h2>
        <p className="text-sm text-slate-600">
          画像がぼやけている、影で見えづらい、または数学の問題ではない可能性があります。
        </p>
      </div>

      {imageSrc && (
        <div className="mt-5 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="読み取れなかった画像" className="w-full max-h-48 object-contain" />
        </div>
      )}

      <div className="mt-5 space-y-2 text-sm text-slate-600 bg-amber-50 rounded-lg p-3 border border-amber-100">
        <p className="font-medium text-amber-900">📝 撮影のコツ</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>明るい場所で、問題全体が画面に収まるように撮る</li>
          <li>カメラを問題と平行に保つ（斜めから撮らない）</li>
          <li>手ぶれしないようにしっかり構える</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onRetake}
        className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
      >
        🔄 撮り直す
      </button>
    </div>
  );
}
