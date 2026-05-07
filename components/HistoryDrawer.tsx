"use client";

import { useEffect, useState } from "react";
import { HistoryEntry } from "@/lib/types";
import { listHistory, deleteEntry, clearHistory } from "@/lib/history";
import { computeStats } from "@/lib/stats";
import { StatsCard } from "./StatsCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  /** 履歴更新トリガー（履歴に変更があった時にインクリメント） */
  refreshKey: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return "昨日";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function HistoryDrawer({ open, onClose, onSelect, refreshKey }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    setEntries(listHistory());
  }, [open, refreshKey]);

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("この履歴を削除しますか？")) return;
    deleteEntry(id);
    setEntries(listHistory());
  }

  function handleClearAll() {
    if (!confirm("すべての履歴を削除します。よろしいですか？")) return;
    clearHistory();
    setEntries([]);
  }

  if (!open) return null;

  const stats = computeStats(entries);

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-50 shadow-2xl flex flex-col"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 0px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
        }}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900">📚 学習履歴</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-12 h-12 -mr-3 flex items-center justify-center rounded-lg active:bg-slate-100 text-slate-500 text-xl"
          >
            ✕
          </button>
        </header>

        <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
          <StatsCard stats={stats} />

          {entries.length === 0 ? null : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">
                  最近の {entries.length} 件
                </h3>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 active:text-red-500"
                >
                  すべて削除
                </button>
              </div>
              <ul className="space-y-2">
                {entries.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left active:bg-slate-50 transition flex gap-3"
                    >
                      {e.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={e.thumbnail}
                          alt=""
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-2xl">
                          {e.inputKind === "text" ? "✏️" : "📷"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                          <span>{formatTime(e.createdAt)}</span>
                          {e.category && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px]">
                              {e.category}
                            </span>
                          )}
                          {e.problems.length > 1 && (
                            <span className="text-[10px] text-slate-500">
                              {e.problems.length}問
                            </span>
                          )}
                          {e.feedback === "good" && <span>👍</span>}
                          {e.feedback === "wrong" && <span>👎</span>}
                        </div>
                        <p className="text-sm text-slate-800 line-clamp-2 break-words">
                          {e.problems[0]?.problemReading || e.question || "(空)"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(ev) => handleDelete(ev, e.id)}
                        aria-label="削除"
                        className="self-start w-8 h-8 -m-1 flex items-center justify-center text-slate-300 active:text-red-500 active:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
