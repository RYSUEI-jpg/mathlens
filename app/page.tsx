"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { ProfileModal } from "@/components/ProfileModal";
import { SettingsBar } from "@/components/SettingsBar";
import { InputTabs, InputMode } from "@/components/InputTabs";
import { ImageInput } from "@/components/ImageInput";
import { ImagePreview } from "@/components/ImagePreview";
import { TextQuestionInput } from "@/components/TextQuestionInput";
import { SubmitButton } from "@/components/SubmitButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ConfirmReadModal } from "@/components/ConfirmReadModal";
import { ShareButton } from "@/components/ShareButton";
import { UnreadableState } from "@/components/UnreadableState";
import { ErrorToast } from "@/components/ErrorToast";
import {
  ApiResponse,
  SolutionResult,
  UNREADABLE_MARKER,
  UserSettings,
} from "@/lib/types";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/storage";

type Phase = "input" | "reading" | "explaining" | "confirm" | "result";

function isUnreadable(results: SolutionResult[]): boolean {
  return (
    results.length === 1 &&
    results[0].problemReading.includes(UNREADABLE_MARKER)
  );
}

const READING_MESSAGE = "📖 問題を読み取っています...";
const EXPLAINING_STAGES = [
  "🧠 解説を考えています...",
  "✏️ 解法ステップを組み立て中...",
  "📐 図解を生成中...",
  "✨ もう少しで完成です...",
];
const TEXT_THINKING_STAGES = [
  "🤔 質問を理解しています...",
  "🧠 説明を考えています...",
  "✨ もう少しで完成です...",
];

export default function Home() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [inputMode, setInputMode] = useState<InputMode>("image");
  const [phase, setPhase] = useState<Phase>("input");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<SolutionResult[] | null>(null);
  const [result, setResult] = useState<SolutionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setHydrated(true);
    if (!s.isProfileSet) setShowProfile(true);
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleSaveSettings(next: UserSettings) {
    setSettings(next);
    saveSettings(next);
    setShowProfile(false);
  }

  function handleReset() {
    setImageFile(null);
    setResult(null);
    setReadingResult(null);
    setPhase("input");
    setError(null);
  }

  function handleModeChange(next: InputMode) {
    if (next === inputMode) return;
    setInputMode(next);
    // モード切り替え時は入力中の画像をクリア（混乱防止）
    if (next === "text") setImageFile(null);
  }

  /** APIコール共通処理。imageFileかquestionどちらかを送る */
  async function callSolveApi(
    payload:
      | { kind: "image"; file: File; mode: "read" | "full" }
      | { kind: "text"; question: string }
  ): Promise<SolutionResult[]> {
    const fd = new FormData();
    if (payload.kind === "image") {
      fd.append("image", payload.file);
      fd.append("mode", payload.mode);
      if (payload.mode === "full") {
        fd.append("grade", settings.grade);
        fd.append("verbosity", settings.verbosity);
      }
    } else {
      fd.append("question", payload.question);
      fd.append("grade", settings.grade);
      fd.append("verbosity", settings.verbosity);
    }
    const res = await fetch("/api/solve", { method: "POST", body: fd });
    const json: ApiResponse = await res.json();
    if (!json.ok) throw new Error(json.error);
    return json.data;
  }

  /** 画像モード: 「解説してもらう」ボタン */
  async function handleImageSubmit() {
    if (!imageFile) return;
    setError(null);

    if (settings.skipReadConfirm) {
      setPhase("explaining");
      try {
        const data = await callSolveApi({ kind: "image", file: imageFile, mode: "full" });
        setResult(data);
        setPhase("result");
      } catch (e) {
        setError(e instanceof Error ? e.message : "通信エラー");
        setPhase("input");
      }
      return;
    }

    setPhase("reading");
    try {
      const data = await callSolveApi({ kind: "image", file: imageFile, mode: "read" });
      if (isUnreadable(data)) {
        setResult(data);
        setPhase("result");
        return;
      }
      setReadingResult(data);
      setPhase("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
      setPhase("input");
    }
  }

  /** テキストモード: 「質問する」ボタン */
  async function handleTextSubmit(question: string) {
    setError(null);
    setPhase("explaining");
    try {
      const data = await callSolveApi({ kind: "text", question });
      setResult(data);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
      setPhase("input");
    }
  }

  /** 確認モーダル: 「合ってる」 → 解説生成 */
  async function handleConfirmRead(skipNext: boolean) {
    if (!imageFile || !readingResult) return;
    if (skipNext && !settings.skipReadConfirm) {
      const next = { ...settings, skipReadConfirm: true };
      setSettings(next);
      saveSettings(next);
    }
    setError(null);
    setPhase("explaining");
    try {
      const data = await callSolveApi({ kind: "image", file: imageFile, mode: "full" });
      setResult(data);
      setReadingResult(null);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
      setPhase("confirm");
    }
  }

  function handleRetake() {
    setReadingResult(null);
    setPhase("input");
  }

  useEffect(() => {
    if (phase === "result" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  if (!hydrated) return <div className="flex-1" />;

  const showResult = phase === "result" && result !== null;
  const isResultUnreadable = showResult && result && isUnreadable(result);
  const isLoading = phase === "reading" || phase === "explaining";
  const isInputPhase = phase === "input";

  return (
    <>
      <Header onOpenSettings={() => setShowProfile(true)} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-28 space-y-5">
        <SettingsBar settings={settings} onEdit={() => setShowProfile(true)} />

        {isInputPhase && (
          <InputTabs mode={inputMode} onChange={handleModeChange} />
        )}

        {isInputPhase && inputMode === "image" && !previewUrl && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              📸 数学の問題を読み込もう
            </h2>
            <ImageInput onSelect={setImageFile} />
          </section>
        )}

        {isInputPhase && inputMode === "image" && previewUrl && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              ✓ この問題でいい？
            </h2>
            <ImagePreview src={previewUrl} onReset={() => setImageFile(null)} />
            <SubmitButton onClick={handleImageSubmit} />
          </section>
        )}

        {isInputPhase && inputMode === "text" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              ✏️ 質問を入力してください
            </h2>
            <TextQuestionInput onSubmit={handleTextSubmit} />
          </section>
        )}

        {isLoading && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            {phase === "reading" ? (
              <LoadingSpinner message={READING_MESSAGE} />
            ) : (
              <LoadingSpinner
                stages={inputMode === "text" ? TEXT_THINKING_STAGES : EXPLAINING_STAGES}
              />
            )}
          </section>
        )}

        {showResult && isResultUnreadable && (
          <UnreadableState imageSrc={previewUrl} onRetake={handleReset} />
        )}

        {showResult && !isResultUnreadable && result && (
          <ResultDisplay
            ref={resultRef}
            results={result}
            imageSrc={inputMode === "image" ? previewUrl : null}
          />
        )}
      </main>

      {/* 結果表示中の固定下部アクションバー */}
      {showResult && !isResultUnreadable && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 p-3">
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2">
            <ShareButton targetRef={resultRef} />
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              🔄 別の質問をする
            </button>
          </div>
        </div>
      )}

      {showProfile && (
        <ProfileModal
          initial={settings}
          isFirstTime={!settings.isProfileSet}
          onSave={handleSaveSettings}
          onClose={settings.isProfileSet ? () => setShowProfile(false) : undefined}
        />
      )}

      {phase === "confirm" && readingResult && (
        <ConfirmReadModal
          problems={readingResult}
          onConfirm={handleConfirmRead}
          onRetake={handleRetake}
        />
      )}

      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </>
  );
}
