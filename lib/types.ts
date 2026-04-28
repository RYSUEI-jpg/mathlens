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
}

export type ApiResponse =
  | { ok: true; data: SolutionResult[] }
  | { ok: false; error: string };

export const UNREADABLE_MARKER = "数学の問題が認識できませんでした";

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
