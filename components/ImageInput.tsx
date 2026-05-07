"use client";

import { useEffect, useRef, useState } from "react";
import { CameraCapture } from "./CameraCapture";

interface Props {
  onSelect: (file: File) => void;
}

export function ImageInput({ onSelect }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteFlash, setPasteFlash] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  }

  function handleCameraCapture(file: File) {
    setShowCamera(false);
    onSelect(file);
  }

  // クリップボードから画像を貼り付け
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            // 一瞬視覚フィードバック
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 600);
            onSelect(file);
            break;
          }
        }
      }
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [onSelect]);

  // ドラッグ&ドロップ
  useEffect(() => {
    let dragCounter = 0;

    function handleDragEnter(e: DragEvent) {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    }
    function handleDragOver(e: DragEvent) {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
    }
    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    }
    function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith("image/")) {
        onSelect(file);
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onSelect]);

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
          className="w-full min-h-14 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg shadow-md active:bg-indigo-700 active:scale-[0.99] transition flex items-center justify-center gap-3"
        >
          <span className="text-2xl">📷</span>
          カメラで撮影
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full min-h-12 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium active:border-indigo-400 active:bg-slate-50 transition flex items-center justify-center gap-3"
        >
          <span className="text-xl">📁</span>
          画像ファイルを選ぶ
        </button>

        {/* ペースト・D&Dヒント（PC向け） */}
        <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px]">
            V
          </kbd>
          <span>で貼り付け、ドラッグ＆ドロップもOK</span>
        </div>

        {/* スマホ向け: 長押しで貼り付けできるヒント */}
        <p className="sm:hidden text-xs text-slate-500 text-center pt-1">
          スクショや画像のコピペにも対応
        </p>
      </div>

      {/* ペースト成功時の一瞬のフラッシュ */}
      {pasteFlash && (
        <div
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse"
        >
          📋 画像を貼り付けました
        </div>
      )}

      {/* ドラッグ中のオーバーレイ */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center pointer-events-none p-6">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center border-4 border-dashed border-indigo-500 max-w-sm">
            <div className="text-6xl mb-3">📥</div>
            <p className="text-xl font-bold text-slate-900">画像をドロップ</p>
            <p className="mt-1 text-sm text-slate-500">ここに離して読み込み</p>
          </div>
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
