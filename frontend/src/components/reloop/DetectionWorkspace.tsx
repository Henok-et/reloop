"use client";

import { useState, useCallback } from "react";
import type { PredictionResponse, VerifiedDetection, SessionRecord, AppPhase } from "@/lib/types";
import { predictImage } from "@/lib/api";
import ImageUploader from "./ImageUploader";
import CameraCapture from "./CameraCapture";
import DetectionCanvas from "./DetectionCanvas";
import DetectionSummary from "./DetectionSummary";
import VerificationPanel from "./VerificationPanel";
import GuidancePanel from "./GuidancePanel";
import RecordPanel from "./RecordPanel";
import ProcessingState from "./ProcessingState";
import EmptyDetection from "./EmptyDetection";

interface Props {
  initialMode: "camera" | "upload";
}

export default function DetectionWorkspace({ initialMode }: Props) {
  const [mode, setMode] = useState<"camera" | "upload">(initialMode);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [verifiedDetections, setVerifiedDetections] = useState<VerifiedDetection[]>([]);
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number | null>(null);

  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setPhase("preview");
    setResult(null);
    setVerifiedDetections([]);
    setError(null);
    setSelectedDetectionIndex(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;

    setPhase("analyzing");
    setError(null);

    try {
      const response = await predictImage(imageFile);
      setResult(response);

      const verified: VerifiedDetection[] = response.detections.map((d) => ({
        ...d,
        verification_status: "ai_detected" as const,
      }));
      setVerifiedDetections(verified);
      setSelectedDetectionIndex(verified.length > 0 ? 0 : null);
      setPhase("results");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Detection service unavailable. Please try again.";
      setError(message);
      setPhase("error");
    }
  }, [imageFile]);

  const handleReset = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setVerifiedDetections([]);
    setError(null);
    setSelectedDetectionIndex(null);
    setPhase("idle");
  }, [imagePreview]);

  const handleRecord = useCallback(
    (newRecords: SessionRecord[]) => {
      setRecords((prev) => [...prev, ...newRecords]);
      try {
        const existing = JSON.parse(localStorage.getItem("reloop_records") || "[]");
        localStorage.setItem("reloop_records", JSON.stringify([...existing, ...newRecords]));
      } catch {
        // silently fail
      }
    },
    []
  );

  const allVerified =
    verifiedDetections.length > 0 &&
    verifiedDetections.every((d) => d.verification_status !== "ai_detected");

  const highConfidenceCount = verifiedDetections.filter((d) => d.confidence >= 0.5).length;
  const aiConfidenceLabel =
    verifiedDetections.length === 0
      ? "NO OBJECTS CONFIDENTLY IDENTIFIED"
      : highConfidenceCount / verifiedDetections.length >= 0.7
        ? "HIGH"
        : "REVIEW REQUIRED";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {phase === "idle" && (
        <div className="mb-6 animate-fade-in">
          <div className="mx-auto flex w-fit gap-1 rounded border border-reloop-border bg-reloop-surface p-1">
            <button
              id="mode-camera"
              onClick={() => setMode("camera")}
              className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                mode === "camera" ? "bg-reloop-green text-white" : "text-reloop-text-secondary hover:text-reloop-text"
              }`}
            >
              Camera
            </button>
            <button
              id="mode-upload"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${
                mode === "upload" ? "bg-reloop-green text-white" : "text-reloop-text-secondary hover:text-reloop-text"
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      )}

      {phase === "idle" && (
        <div className="animate-fade-in">
          {mode === "camera" ? <CameraCapture onCapture={handleImageSelected} /> : <ImageUploader onImageSelected={handleImageSelected} />}
        </div>
      )}

      {phase === "preview" && imagePreview && (
        <div className="mx-auto max-w-2xl animate-fade-in-scale">
          <div className="overflow-hidden border border-reloop-border bg-reloop-surface">
            <div className="flex items-center justify-between border-b border-reloop-border p-4">
              <h2 className="text-sm font-medium text-reloop-text">Image Preview</h2>
              <span className="text-xs text-reloop-text-muted">{imageFile?.name}</span>
            </div>
            <div className="flex items-center justify-center bg-reloop-black p-4">
              <img src={imagePreview} alt="Uploaded e-waste image preview" className="max-h-[60vh] w-auto object-contain" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <button
                id="btn-back"
                onClick={handleReset}
                className="rounded border border-reloop-border px-4 py-2.5 text-sm font-medium text-reloop-text-secondary transition-colors hover:bg-reloop-surface-elevated hover:text-reloop-text"
              >
                Choose Different Image
              </button>
              <button
                id="btn-analyze"
                onClick={handleAnalyze}
                className="rounded bg-reloop-green px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
              >
                Analyze Image
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "analyzing" && <ProcessingState />}

      {phase === "error" && (
        <div className="mx-auto max-w-md animate-fade-in">
          <div className="border border-reloop-error/30 bg-reloop-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-reloop-error-muted">
              <span className="text-base text-reloop-error">!</span>
            </div>
            <p className="mb-1 text-sm font-medium text-reloop-text">Detection Error</p>
            <p className="mb-6 text-sm text-reloop-text-secondary">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                id="btn-retry"
                onClick={handleAnalyze}
                className="rounded bg-reloop-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
              >
                Retry
              </button>
              <button
                onClick={handleReset}
                className="rounded border border-reloop-border px-5 py-2.5 text-sm font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
              >
                Try Another Image
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "results" && result && imagePreview && (
        <div className="animate-fade-in">
          {result.detections.length === 0 ? (
            <EmptyDetection onReset={handleReset} />
          ) : (
            <div className="space-y-6">
              <header className="border-b border-reloop-border pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-reloop-text-muted">ReLoop</p>
                    <h1 className="mt-2 text-2xl font-medium tracking-tight text-reloop-text md:text-3xl">
                      AI-Assisted E-Waste Identification
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-reloop-border bg-reloop-surface-elevated px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">
                      <span className="text-reloop-green-light">●</span> ANALYSIS COMPLETE
                    </div>
                    <div className="rounded-full border border-reloop-border bg-reloop-surface-elevated px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">
                      {aiConfidenceLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">
                  {[
                    "Capture ✓",
                    "Identify ✓",
                    "Verify Active",
                    "Guide",
                    "Record",
                  ].map((step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className={index === 2 ? "text-reloop-green-light" : ""}>{step}</span>
                      {index < 4 && <span className="text-reloop-text-muted">—</span>}
                    </div>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_0.95fr]">
                <div className="space-y-6">
                  <DetectionCanvas
                    imageSrc={imagePreview}
                    detections={verifiedDetections}
                    imageWidth={result.image_width}
                    imageHeight={result.image_height}
                    selectedIndex={selectedDetectionIndex}
                    onSelect={setSelectedDetectionIndex}
                  />
                  <DetectionSummary detections={verifiedDetections} />
                </div>

                <div className="space-y-6">
                  <VerificationPanel
                    detections={verifiedDetections}
                    onUpdate={setVerifiedDetections}
                    selectedIndex={selectedDetectionIndex}
                    onSelect={setSelectedDetectionIndex}
                  />
                  {allVerified && (
                    <div className="animate-slide-up">
                      <GuidancePanel detections={verifiedDetections} />
                    </div>
                  )}
                  {allVerified && (
                    <div className="animate-slide-up">
                      <RecordPanel
                        detections={verifiedDetections}
                        sessionId={result.session_id}
                        imageReference={imageFile?.name || "capture"}
                        onRecord={handleRecord}
                        existingRecords={records}
                      />
                    </div>
                  )}
                  {!allVerified && verifiedDetections.length > 0 && (
                    <div className="border border-reloop-border bg-reloop-warning-muted/25 p-4 text-xs text-reloop-warning">
                      REVIEW REQUIRED — Several AI detections have low confidence. Please verify each item before recording.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              id="btn-new-scan"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded border border-reloop-border bg-reloop-surface-elevated px-5 py-2.5 text-sm font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
            >
              Scan Another Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
