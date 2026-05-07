export type Grade = "junior" | "high" | "university" | "other";
export type Verbosity = "brief" | "standard" | "detailed";

export interface UserSettings {
  grade: Grade;
  verbosity: Verbosity;
  skipReadConfirm: boolean;
  isProfileSet: boolean;
}

export interface SolutionResult {
  problemReading: string;
  approach: string;
  steps: string;
  answer: string;
  /** Optional inline SVG markup for visual aid (geometry, graphs, etc.) */
  diagram?: string;
}

export type ApiResponse =
  | { ok: true; data: SolutionResult[] }
  | { ok: false; error: string };

export const UNREADABLE_MARKER = "数学の問題が認識できませんでした";

export type FeedbackValue = "good" | "wrong" | "alternative";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type InputKind = "image" | "text";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  inputKind: InputKind;
  /** テキストモード時の入力 */
  question?: string;
  /** 画像モード時の縮小サムネ (data URL, 最大240px) */
  thumbnail?: string;
  problems: SolutionResult[];
  grade: Grade;
  verbosity: Verbosity;
  feedback?: FeedbackValue;
  followUps?: ChatMessage[];
  /** カテゴリ（自動推定: 一次方程式、微分、図形 など） */
  category?: string;
}

export const GRADE_LABEL: Record<Grade, string> = {
  junior: "中学生",
  high: "高校生",
  university: "大学生",
  other: "一般",
};

export const VERBOSITY_LABEL: Record<Verbosity, string> = {
  brief: "簡潔",
  standard: "標準",
  detailed: "詳細",
};
