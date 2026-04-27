"use client";

import { RefObject, useState } from "react";
import { toPng } from "html-to-image";

interface Props {
  targetRef: RefObject<HTMLDivElement | null>;
}

export function ShareButton({ targetRef }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!targetRef.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: "#f8fafc",
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "mathlens-result.png", { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
        share?: (data?: ShareData) => Promise<void>;
      };

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: "MathLens 解説結果" });
          return;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
        }
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "mathlens-result.png";
      a.click();
    } catch (e) {
      console.error(e);
      alert("画像の保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="px-5 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium hover:border-indigo-400 transition disabled:opacity-50 flex items-center gap-2"
    >
      {busy ? "📸 保存中..." : "📤 画像で共有"}
    </button>
  );
}
