"use client";

import { useState, useCallback } from "react";
import type { VerifiedDetection } from "@/lib/types";
import { GIZ_CLASSES } from "@/lib/constants";

interface Props {
  detections: VerifiedDetection[];
  onUpdate: (detections: VerifiedDetection[]) => void;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

export default function VerificationPanel({ detections, onUpdate, selectedIndex, onSelect }: Props) {
  const [correctingIndex, setCorrectingIndex] = useState<number | null>(null);

  const handleConfirm = useCallback(
    (index: number) => {
      const updated = [...detections];
      updated[index] = {
        ...updated[index],
        verification_status: "worker_verified",
      };
      onUpdate(updated);
      onSelect(index);
    },
    [detections, onUpdate, onSelect]
  );

  const handleCorrect = useCallback(
    (index: number, newClass: string) => {
      const updated = [...detections];
      updated[index] = {
        ...updated[index],
        verification_status: "corrected",
        corrected_class: newClass,
      };
      onUpdate(updated);
      onSelect(index);
      setCorrectingIndex(null);
    },
    [detections, onUpdate, onSelect]
  );

  const handleFlag = useCallback(
    (index: number) => {
      const updated = [...detections];
      updated[index] = {
        ...updated[index],
        verification_status: "flagged",
      };
      onUpdate(updated);
      onSelect(index);
    },
    [detections, onUpdate, onSelect]
  );

  const allVerified = detections.every((d) => d.verification_status !== "ai_detected");

  return (
    <div className="overflow-hidden border border-reloop-border bg-reloop-surface">
      <div className="border-b border-reloop-border px-4 py-3 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Verification</p>
            <h2 className="mt-2 text-lg font-medium text-reloop-text">Verify Identifications</h2>
          </div>
          {allVerified && (
            <span className="rounded-full border border-reloop-green/20 bg-reloop-green-muted px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-reloop-green-light">
              Ready
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-reloop-text-muted">
          AI-assisted classification. Worker confirmation is required before recording.
        </p>
      </div>

      <div className="divide-y divide-reloop-border">
        {detections.map((det, i) => {
          const displayName = det.corrected_class || det.class_name;
          const isVerified = det.verification_status !== "ai_detected";
          const isCorrecting = correctingIndex === i;
          const isSelected = selectedIndex === i;

          return (
            <div
              key={`${det.class_id}-${i}`}
              onClick={() => onSelect(i)}
              className={`cursor-pointer p-4 transition-colors md:p-5 ${isSelected ? "bg-reloop-surface-elevated" : ""}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">#{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-reloop-text">{displayName}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-reloop-text-muted">{Math.round(det.confidence * 100)}% AI confidence</p>
                </div>
                <VerificationBadge status={det.verification_status} />
              </div>

              {!isVerified && !isCorrecting && (
                <div className="flex flex-wrap gap-2">
                  <button
                    id={`btn-confirm-${i}`}
                    onClick={() => handleConfirm(i)}
                    className="flex-1 min-w-[90px] rounded border border-reloop-green/20 bg-reloop-green-muted px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-reloop-green-light transition-colors hover:bg-reloop-green/15"
                  >
                    Confirm
                  </button>
                  <button
                    id={`btn-correct-${i}`}
                    onClick={() => setCorrectingIndex(i)}
                    className="flex-1 min-w-[90px] rounded border border-reloop-border bg-reloop-surface-elevated px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-reloop-text-secondary transition-colors hover:bg-reloop-surface-hover"
                  >
                    Correct
                  </button>
                  <button
                    id={`btn-flag-${i}`}
                    onClick={() => handleFlag(i)}
                    className="flex-1 min-w-[90px] rounded border border-reloop-warning/20 bg-reloop-warning-muted px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-reloop-warning transition-colors hover:bg-reloop-warning/10"
                  >
                    Flag
                  </button>
                </div>
              )}

              {isCorrecting && (
                <div className="animate-fade-in">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Select correct GIZ class</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GIZ_CLASSES.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => handleCorrect(i, cls)}
                        className={`rounded border px-2 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                          cls === det.class_name
                            ? "border-reloop-text-muted bg-reloop-surface-elevated text-reloop-text-muted"
                            : "border-reloop-border bg-reloop-surface-elevated text-reloop-text hover:bg-reloop-surface-hover"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCorrectingIndex(null)}
                    className="mt-2 text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted transition-colors hover:text-reloop-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {isVerified && (
                <div className="mt-3 text-[11px] text-reloop-text-muted">
                  {det.verification_status === "corrected" && (
                    <span>
                      Corrected from <span className="line-through">{det.class_name}</span> to <span className="font-medium text-reloop-earth-light">{det.corrected_class}</span>
                    </span>
                  )}
                  {det.verification_status === "worker_verified" && (
                    <span className="text-reloop-green-light">Classification confirmed by worker.</span>
                  )}
                  {det.verification_status === "flagged" && (
                    <span className="text-reloop-warning">Flagged for review.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  switch (status) {
    case "worker_verified":
      return (
        <span className="rounded-full border border-reloop-green/20 bg-reloop-green-muted px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-reloop-green-light">
          Verified
        </span>
      );
    case "corrected":
      return (
        <span className="rounded-full border border-reloop-warning/20 bg-reloop-warning-muted px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-reloop-earth-light">
          Corrected
        </span>
      );
    case "flagged":
      return (
        <span className="rounded-full border border-reloop-warning/20 bg-reloop-warning-muted px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-reloop-warning">
          Flagged
        </span>
      );
    default:
      return (
        <span className="rounded-full border border-reloop-border bg-reloop-surface-elevated px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-reloop-text-muted">
          AI
        </span>
      );
  }
}
