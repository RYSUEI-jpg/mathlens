"use client";

import { useState } from "react";

interface Props {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "答えをコピー" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Clipboard API failed");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm min-h-10 px-3 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-700 active:bg-emerald-50 transition flex items-center gap-1.5"
      aria-label={label}
    >
      {copied ? (
        <>✓ コピー済</>
      ) : (
        <>📋 コピー</>
      )}
    </button>
  );
}
