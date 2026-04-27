"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  children: string;
  className?: string;
}

export function MathRenderer({ children, className }: Props) {
  return (
    <div className={`prose prose-slate max-w-none prose-p:my-2 prose-li:my-1 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
