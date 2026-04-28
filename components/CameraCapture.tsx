"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("このブラウザはカメラ機能に対応していません");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch (e) {
        if (e instanceof Error) {
          if (e.name === "NotAllowedError") {
            setError("カメラの使用が許可されませんでした。ブラウザの設定から許可してください。");
          } else if (e.name === "NotFoundError") {
            setError("カメラが見つかりませんでした。");
          } else {
            setError(e.message);
          }
        } else {
          setError("カメラを起動できませんでした");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `mathlens-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-3 text-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg hover:bg-white/10"
        >
          ← 閉じる
        </button>
        <span className="text-sm opacity-70">カメラで撮影</span>
        <span className="w-16" />
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 max-w-md">
            <div className="text-4xl mb-3">📷❌</div>
            <p className="text-lg font-bold">カメラを開けませんでした</p>
            <p className="mt-2 text-sm text-slate-300">{error}</p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 px-5 py-2 rounded-lg bg-white text-black font-medium"
            >
              戻る
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="inline-block w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="mt-3 text-sm">カメラを起動中...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!error && (
        <div className="bg-black/90 py-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            aria-label="撮影"
            className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 active:scale-95 transition disabled:opacity-40 flex items-center justify-center"
          >
            <span className="w-16 h-16 rounded-full bg-white border-2 border-black/20" />
          </button>
        </div>
      )}
    </div>
  );
}
