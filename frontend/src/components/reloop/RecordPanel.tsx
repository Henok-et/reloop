"use client";

import { useState, useCallback } from "react";
import type { VerifiedDetection, SessionRecord } from "@/lib/types";

interface Props {
  detections: VerifiedDetection[];
  sessionId: string;
  imageReference: string;
  onRecord: (records: SessionRecord[]) => void;
  existingRecords: SessionRecord[];
}

export default function RecordPanel({
  detections,
  sessionId,
  imageReference,
  onRecord,
  existingRecords,
}: Props) {
  const [recorded, setRecorded] = useState(false);

  const handleRecord = useCallback(() => {
    const verified = detections.filter((det) => det.verification_status !== "ai_detected");
    const newRecords: SessionRecord[] = verified.map((det, i) => ({
      id: `${sessionId}-${i}`,
      session_id: sessionId,
      detected_class: det.class_name,
      verified_class: det.corrected_class || det.class_name,
      confidence: det.confidence,
      verification_status: det.verification_status,
      timestamp: new Date().toISOString(),
      image_reference: imageReference,
    }));

    onRecord(newRecords);
    setRecorded(true);
  }, [detections, sessionId, imageReference, onRecord]);

  const verifiedItems = detections.filter((d) => d.verification_status !== "ai_detected");

  return (
    <div className="overflow-hidden border border-reloop-border bg-reloop-surface">
      <div className="border-b border-reloop-border px-4 py-3 md:px-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Session Record</p>
        <h2 className="mt-2 text-lg font-medium text-reloop-text">Verified Items</h2>
      </div>

      <div className="p-4 md:p-5">
        {!recorded ? (
          <div>
            <div className="mb-4 border-b border-reloop-border pb-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Verification Status</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-light tracking-tight text-reloop-text">{verifiedItems.length}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">/ {detections.length} verified</p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              {detections.slice(0, 6).map((det, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded border border-reloop-border bg-reloop-surface-elevated px-2.5 py-2 text-[11px]">
                  <span className="text-reloop-text">{det.corrected_class || det.class_name}</span>
                  <span className="text-reloop-text-muted">{Math.round(det.confidence * 100)}%</span>
                </div>
              ))}
            </div>

            <button
              id="btn-record"
              onClick={handleRecord}
              className="w-full rounded border border-reloop-green/20 bg-reloop-green px-4 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-reloop-green-light"
            >
              Record Verified Items
            </button>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-reloop-green-muted">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-reloop-green-light" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-reloop-text">Session Recorded</p>
            <p className="mt-1 text-xs text-reloop-text-muted">{verifiedItems.length} verified items saved to this session.</p>
            {existingRecords.length > 0 && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted">
                Total records: {existingRecords.length + verifiedItems.length}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
