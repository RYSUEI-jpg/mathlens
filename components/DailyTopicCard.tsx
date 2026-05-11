"use client";

import { useEffect, useState } from "react";
import { DailyTopicSeed, getRandomTopic, getTodayTopic } from "@/lib/discover";
import { Grade } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";

interface Props {
  grade: Grade;
}

export function DailyTopicCard({ grade }: Props) {
  const [topic, setTopic] = useState<DailyTopicSeed>(() => getTodayTopic());
  const [content, setContent] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);

  // 日付が変わったらリセット
  useEffect(() => {
    const today = getTodayTopic();
    setTopic(today);
  }, []);

  async function loadContent(t: DailyTopicSeed) {
    setBusy(true);
    setContent("");
    setOpened(true);
    try {
      const fd = new FormData();
      fd.append("kind", "daily");
      fd.append("title", t.title);
      fd.append("hook", t.hook);
      fd.append("grade", grade);
      const res = await fetch("/api/explore", { method: "POST", body: fd });
      if (!res.ok || !res.body) {
        setContent("読み込みに失敗しました。少し待って再試行してね。");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setContent(acc);
      }
      acc += decoder.decode();
      setContent(acc);
    } catch (e) {
      setContent(
        "エラーが発生しました: " + (e instanceof Error ? e.message : "")
      );
    } finally {
      setBusy(false);
    }
  }

  function handleAnotherTopic() {
    const next = getRandomTopic(topic.id);
    setTopic(next);
    setContent("");
    setOpened(false);
  }

  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-amber-50 border border-fuchsia-100 rounded-2xl p-4">
      <div className="text-xs font-bold text-fuchsia-700 mb-1">🎲 今日の数学</div>
      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0">{topic.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {topic.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1">{topic.hook}</p>
        </div>
      </div>

      {!opened && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => loadContent(topic)}
            className="flex-1 min-h-12 px-4 rounded-xl bg-fuchsia-600 text-white font-semibold active:bg-fuchsia-700 transition"
          >
            📖 読んでみる
          </button>
          <button
            type="button"
            onClick={handleAnotherTopic}
            className="min-h-12 px-4 rounded-xl bg-white border-2 border-fuchsia-200 text-fuchsia-700 font-medium active:bg-fuchsia-50"
            aria-label="別の話題を見る"
          >
            🎲
          </button>
        </div>
      )}

      {opened && (
        <div className="mt-3 bg-white rounded-xl p-3 border border-fuchsia-100">
          {busy && !content && (
            <div className="flex gap-1 text-fuchsia-400 py-2">
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          {content && (
            busy ? (
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {content}
                <span className="inline-block w-1.5 h-4 bg-fuchsia-500 animate-pulse align-middle ml-0.5 rounded-sm" />
              </div>
            ) : (
              <MathRenderer>{content}</MathRenderer>
            )
          )}
          {!busy && content && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleAnotherTopic}
                className="flex-1 min-h-10 px-3 rounded-lg text-sm bg-fuchsia-50 text-fuchsia-700 active:bg-fuchsia-100 font-medium"
              >
                🎲 別の話題を見る
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
