import { UserSettings } from "./types";

const KEY = "mathlens.settings.v1";

export const DEFAULT_SETTINGS: UserSettings = {
  grade: "high",
  verbosity: "standard",
  skipReadConfirm: false,
  isProfileSet: false,
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(settings));
}
