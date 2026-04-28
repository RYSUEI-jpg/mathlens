"use client";

import { useRef, useState } from "react";
import { CameraCapture } from "./CameraCapture";

interface Props {
  onSelect: (file: File) => void;
}

export function ImageInput({ onSelect }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  }

  function handleCameraCapture(file: File) {
    setShowCamera(false);
    onSelect(file);
  }

  return (
    <>
      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg shadow-md hover:bg-indigo-700 active:scale-[0.99] transition flex items-center justify-center gap-3"
        >
          <span className="text-2xl">📷</span>
          カメラで撮影
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium hover:border-indigo-400 hover:bg-slate-50 transition flex items-center justify-center gap-3"
        >
          <span className="text-xl">📁</span>
          画像ファイルを選ぶ
        </button>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
