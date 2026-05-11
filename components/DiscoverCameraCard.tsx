"use client";

import { useEffect, useState } from "react";
import { ApiResponse, Grade, SolutionResult } from "@/lib/types";
import { resizeImage } from "@/lib/image";
import { ImageInput } from "./ImageInput";
import { ImagePreview } from "./ImagePreview";
import { LoadingSpinner } from "./LoadingSpinner";
import { MathRenderer } from "./MathRenderer";
import { DiagramRenderer } from "./DiagramRenderer";

interface Props {
  grade: Grade;
}

const STAGES = [
  "🔍 画像をスキャン中...",
  "🧠 数学の視点を探しています...",
  "📐 図解を準備中...",
  "✨ もう少しで発見...",
];

export function DiscoverCameraCard({ grade }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function discover() {
    if (!imageFile) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const resized = await resizeImage(imageFile);
      const fd = new FormData();
      fd.append("image", resized);
      fd.append("grade", grade);
      const res = await fetch("/api/discover-image", { method: "POST", body: fd });
      const json: ApiResponse = await res.json();
      if (!json.ok) {
        setError(json.error);
      } else {
        setResult(json.data[0] ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setImageFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
      <div className="text-xs font-bold text-amber-700 mb-1">📸 撮って発見</div>
      <h3 className="text-base font-bold text-slate-900">
        身の回りのものから数学を見つけよう
      </h3>
      <p className="text-xs text-slate-600 mt-1 mb-3">
        時計・植物・建物・食べ物などを撮ると、そこに隠れた数学をAIが解説します
      </p>

      {!previewUrl && !result && (
        <div className="bg-white rounded-xl p-3 border border-amber-100">
          <ImageInput onSelect={setImageFile} />
        </div>
      )}

      {previewUrl && !result && !busy && (
        <div className="bg-white rounded-xl p-3 border border-amber-100 space-y-3">
          <ImagePreview src={previewUrl} onReset={reset} />
          <button
            type="button"
            onClick={discover}
            className="w-full min-h-14 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-md active:scale-[0.99] transition"
          >
            🔍 隠れた数学を発見する
          </button>
        </div>
      )}

      {busy && (
        <div className="bg-white rounded-xl p-3 border border-amber-100">
          <LoadingSpinner stages={STAGES} />
        </div>
      )}

      {result && (
        <div className="space-y-2">
          {previewUrl && (
            <div className="bg-white rounded-xl p-2 border border-amber-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="撮影した画像"
                className="w-full max-h-40 object-contain rounded-lg"
              />
            </div>
          )}
          {result.problemReading && (
            <div className="bg-white rounded-xl p-3 border border-amber-200">
              <div className="text-xs font-bold text-amber-700 mb-1">📸 写っているもの</div>
              <MathRenderer>{result.problemReading}</MathRenderer>
            </div>
          )}
          {result.diagram && <DiagramRenderer svg={result.diagram} />}
          {result.approach && (
            <div className="bg-white rounded-xl p-3 border border-amber-200">
              <div className="text-xs font-bold text-amber-700 mb-1">🔍 隠れた数学</div>
              <MathRenderer>{result.approach}</MathRenderer>
            </div>
          )}
          {result.steps && (
            <div className="bg-white rounded-xl p-3 border border-amber-200">
              <div className="text-xs font-bold text-amber-700 mb-1">📖 もう少し詳しく</div>
              <MathRenderer>{result.steps}</MathRenderer>
            </div>
          )}
          {result.answer && (
            <div className="bg-amber-100/60 rounded-xl p-3 border border-amber-300">
              <div className="text-xs font-bold text-amber-800 mb-1">💡 これで何が分かる？</div>
              <MathRenderer>{result.answer}</MathRenderer>
            </div>
          )}
          <button
            type="button"
            onClick={reset}
            className="w-full min-h-12 py-3 rounded-xl bg-white border-2 border-amber-200 text-amber-700 font-medium active:bg-amber-50 transition"
          >
            🔄 別のものを撮る
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
          ⚠️ {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 text-red-500 underline text-xs"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
