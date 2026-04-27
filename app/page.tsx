"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { ProfileModal } from "@/components/ProfileModal";
import { SettingsBar } from "@/components/SettingsBar";
import { ImageInput } from "@/components/ImageInput";
import { ImagePreview } from "@/components/ImagePreview";
import { SubmitButton } from "@/components/SubmitButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ConfirmReadModal } from "@/components/ConfirmReadModal";
import { ShareButton } from "@/components/ShareButton";
import { ErrorToast } from "@/components/ErrorToast";
import { ApiResponse, SolutionResult, UserSettings } from "@/lib/types";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/storage";

type Phase = "input" | "loading" | "confirm" | "result";

export default function Home() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [phase, setPhase] = useState<Phase>("input");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<SolutionResult | null>(null);
  const [result, setResult] = useState<SolutionResult | null>(null);
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
    setPendingResult(null);
    setPhase("input");
    setError(null);
  }

  async function handleSubmit() {
    if (!imageFile) return;
    setPhase("loading");
    setError(null);

    const fd = new FormData();
    fd.append("image", imageFile);
    fd.append("grade", settings.grade);
    fd.append("verbosity", settings.verbosity);

    try {
      const res = await fetch("/api/solve", { method: "POST", body: fd });
      const json: ApiResponse = await res.json();
      if (!json.ok) {
        setError(json.error);
        setPhase("input");
        return;
      }

      if (settings.skipReadConfirm) {
        setResult(json.data);
        setPhase("result");
      } else {
        setPendingResult(json.data);
        setPhase("confirm");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "通信エラー";
      setError(`通信に失敗しました: ${msg}`);
      setPhase("input");
    }
  }

  function handleConfirmRead(skipNext: boolean) {
    if (!pendingResult) return;
    if (skipNext && !settings.skipReadConfirm) {
      const next = { ...settings, skipReadConfirm: true };
      setSettings(next);
      saveSettings(next);
    }
    setResult(pendingResult);
    setPendingResult(null);
    setPhase("result");
  }

  function handleRetake() {
    setPendingResult(null);
    setPhase("input");
  }

  useEffect(() => {
    if (phase === "result" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  if (!hydrated) return <div className="flex-1" />;

  return (
    <>
      <Header onOpenSettings={() => setShowProfile(true)} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-5">
        <SettingsBar settings={settings} onEdit={() => setShowProfile(true)} />

        {phase === "input" && !previewUrl && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              📸 数学の問題を読み込もう
            </h2>
            <ImageInput onSelect={setImageFile} />
          </section>
        )}

        {phase === "input" && previewUrl && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              ✓ この問題でいい？
            </h2>
            <ImagePreview src={previewUrl} onReset={() => setImageFile(null)} />
            <SubmitButton onClick={handleSubmit} />
          </section>
        )}

        {phase === "loading" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <LoadingSpinner message="AIが問題を解いています..." />
          </section>
        )}

        {phase === "result" && result && (
          <>
            <ResultDisplay ref={resultRef} result={result} />
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <ShareButton targetRef={resultRef} />
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium hover:border-indigo-400 transition"
              >
                🔄 別の問題を解く
              </button>
            </div>
          </>
        )}
      </main>

      {showProfile && (
        <ProfileModal
          initial={settings}
          isFirstTime={!settings.isProfileSet}
          onSave={handleSaveSettings}
          onClose={settings.isProfileSet ? () => setShowProfile(false) : undefined}
        />
      )}

      {phase === "confirm" && pendingResult && (
        <ConfirmReadModal
          problemReading={pendingResult.problemReading}
          onConfirm={handleConfirmRead}
          onRetake={handleRetake}
        />
      )}

      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </>
  );
}
