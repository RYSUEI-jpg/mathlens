import { ChatMessage, FeedbackValue, HistoryEntry, SolutionResult } from "./types";

const KEY = "mathlens.history.v1";
const MAX_ENTRIES = 50; // localStorage 容量を考慮した上限

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    // QuotaExceeded時は古いものから削減
    if (list.length > 1) {
      try {
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, list.length - 5)));
      } catch {
        // 諦める
        console.error("History save failed", e);
      }
    }
  }
}

/** 簡易カテゴリ推定（problemReadingの内容からキーワード判定） */
function detectCategory(problems: SolutionResult[]): string | undefined {
  const text = problems.map((p) => p.problemReading).join(" ");
  const rules: Array<[RegExp, string]> = [
    [/微分|導関数|極値|接線|f'\(|f''\(/, "微分"],
    [/積分|∫|面積/, "積分"],
    [/sin|cos|tan|三角関数|加法定理/, "三角関数"],
    [/ベクトル|→|内積/, "ベクトル"],
    [/log|指数|対数/, "指数・対数"],
    [/確率|順列|組み合わせ|期待値/, "確率"],
    [/数列|級数|漸化式|Σ/, "数列"],
    [/二次方程式|x[²2].*=|平方根|因数分解/, "二次方程式"],
    [/一次方程式|^[^a-z]*\d?x\s*[+\-]/, "一次方程式"],
    [/連立方程式/, "連立方程式"],
    [/円|半径|円周|π|楕円/, "図形（円）"],
    [/三角形|台形|平行四辺形|多角形/, "図形（多角形）"],
    [/座標|放物線|直線の方程式|交点/, "座標平面"],
    [/関数|グラフ/, "関数"],
    [/集合/, "集合・論理"],
  ];
  for (const [re, name] of rules) {
    if (re.test(text)) return name;
  }
  return undefined;
}

export function listHistory(): HistoryEntry[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getEntry(id: string): HistoryEntry | null {
  return read().find((e) => e.id === id) ?? null;
}

export function addEntry(
  partial: Omit<HistoryEntry, "id" | "createdAt" | "category">
): HistoryEntry {
  const entry: HistoryEntry = {
    ...partial,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    category: detectCategory(partial.problems),
  };
  const list = [entry, ...read()].slice(0, MAX_ENTRIES);
  write(list);
  return entry;
}

export function updateEntry(
  id: string,
  patch: Partial<Pick<HistoryEntry, "feedback" | "followUps">>
): HistoryEntry | null {
  const list = read();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch };
  list[idx] = updated;
  write(list);
  return updated;
}

export function deleteEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory() {
  write([]);
}

export function appendFollowUp(id: string, message: ChatMessage) {
  const list = read();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const followUps = [...(list[idx].followUps ?? []), message];
  list[idx] = { ...list[idx], followUps };
  write(list);
}

export function setFeedback(id: string, feedback: FeedbackValue) {
  updateEntry(id, { feedback });
}
