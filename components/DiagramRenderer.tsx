"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface Props {
  svg: string;
}

/**
 * AI生成のSVGを安全にレンダリングする。
 * - DOMPurifyでXSS対策（script・on*属性などを除去）
 * - viewBoxが無いものは破棄（描画崩れ防止）
 * - SSR時は空、クライアントマウント後にサニタイズしてレンダリング
 */
export function DiagramRenderer({ svg }: Props) {
  const [clean, setClean] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!svg.includes("<svg")) {
      setClean(null);
      return;
    }
    const sanitized = DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["script", "foreignObject"],
      FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover"],
    });
    // viewBox必須（無いと描画崩れるので弾く）
    if (!sanitized.includes("viewBox")) {
      setClean(null);
      return;
    }
    setClean(sanitized);
  }, [svg]);

  if (!clean) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
        <span>📐</span>
        <span>図解</span>
      </div>
      <div
        className="diagram-svg w-full overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}
