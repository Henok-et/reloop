"use client";

import { useEffect, useState } from "react";
import { assessFrame, type FrameAssessment } from "@/lib/frameQuality";

interface Props {
  file: File;
  previewUrl: string;
  onAnalyze: () => void;
  onRetake: () => void;
}

/**
 * The photo stays on screen with Analyze on top of it. Three on-device
 * checks warn about the frames that usually come back empty.
 */
export default function PreviewStage({ file, previewUrl, onAnalyze, onRetake }: Props) {
  // Result is keyed by the file it was computed for, so a new file shows "checking" without a reset.
  const [assessed, setAssessed] = useState<{ file: File; result: FrameAssessment | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    assessFrame(file).then((result) => {
      if (!cancelled) setAssessed({ file, result });
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const assessment: FrameAssessment | null | undefined =
    assessed && assessed.file === file ? assessed.result : undefined;
  const warnings = assessment?.warnings ?? 0;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-scale space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-reloop-border bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
        <img
          src={previewUrl}
          alt="Photo ready for analysis"
          className="mx-auto max-h-[62vh] w-auto object-contain"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-4">
          <button
            id="btn-back"
            type="button"
            onClick={onRetake}
            className="rounded border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-black/60"
          >
            Retake
          </button>
          <button
            id="btn-analyze"
            type="button"
            onClick={onAnalyze}
            className="inline-flex items-center gap-2 rounded bg-reloop-green px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/30 transition-colors hover:bg-reloop-green-light"
          >
            Analyze
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-reloop-border bg-reloop-surface px-4 py-3">
        {assessment === undefined && (
          <p className="text-xs text-reloop-text-muted">Checking the frame…</p>
        )}
        {assessment === null && (
          <p className="text-xs text-reloop-text-muted">Frame checks unavailable for this file.</p>
        )}
        {assessment && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
            {assessment.checks.map((check) => (
              <div key={check.key} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
                    check.status === "pass"
                      ? "bg-reloop-green-muted text-reloop-green-light"
                      : "bg-reloop-warning-muted text-reloop-warning"
                  }`}
                  aria-hidden="true"
                >
                  {check.status === "pass" ? "✓" : "!"}
                </span>
                <div>
                  <p className={check.status === "pass" ? "text-reloop-text-secondary" : "text-reloop-text"}>
                    {check.label}
                  </p>
                  <p className="text-[11px] text-reloop-text-muted">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {warnings > 0 && (
          <p className="mt-2 border-t border-reloop-border pt-2 text-[11px] text-reloop-warning">
            You can still analyze, but a retake usually finds more.
          </p>
        )}
      </div>
    </div>
  );
}
