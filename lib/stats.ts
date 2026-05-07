import { HistoryEntry } from "./types";

export interface Stats {
  totalProblems: number;
  totalSessions: number;
  byCategory: Array<{ category: string; count: number }>;
  streakDays: number;
  lastSolvedAt: number | null;
  helpfulRate: number | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function computeStats(history: HistoryEntry[]): Stats {
  const totalSessions = history.length;
  const totalProblems = history.reduce((sum, e) => sum + e.problems.length, 0);

  // カテゴリ集計
  const catMap = new Map<string, number>();
  for (const e of history) {
    if (e.category) {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.problems.length);
    }
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // 連続日数
  const dayKeys = new Set(history.map((e) => dayKey(e.createdAt)));
  let streakDays = 0;
  let cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const k = dayKey(cursor.getTime());
    if (dayKeys.has(k)) {
      streakDays++;
      cursor = new Date(cursor.getTime() - ONE_DAY_MS);
    } else if (i === 0) {
      // 今日まだ解いてない場合、昨日からカウント開始するため continue
      cursor = new Date(cursor.getTime() - ONE_DAY_MS);
    } else {
      break;
    }
  }

  // フィードバック満足度
  const feedbacks = history.filter((e) => e.feedback);
  const helpful = feedbacks.filter((e) => e.feedback === "good").length;
  const helpfulRate =
    feedbacks.length > 0 ? Math.round((helpful / feedbacks.length) * 100) : null;

  const lastSolvedAt = history[0]?.createdAt ?? null;

  return {
    totalProblems,
    totalSessions,
    byCategory,
    streakDays,
    lastSolvedAt,
    helpfulRate,
  };
}
