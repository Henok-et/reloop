"use client";

import type { VerifiedDetection } from "@/lib/types";
import { CONFIDENCE_LOW } from "@/lib/constants";

interface Props {
  detections: VerifiedDetection[];
}

function getStatusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case "worker_verified":
      return { text: "Verified", className: "text-reloop-green-light bg-reloop-green-muted" };
    case "corrected":
      return { text: "Corrected", className: "text-reloop-earth-light bg-reloop-warning-muted" };
    case "flagged":
      return { text: "Flagged", className: "text-reloop-warning bg-reloop-warning-muted" };
    default:
      return { text: "AI", className: "text-reloop-text-muted bg-reloop-surface-elevated" };
  }
}

export default function DetectionSummary({ detections }: Props) {
  const grouped = detections.reduce<Record<string, { count: number; confidences: number[]; statuses: string[] }>>(
    (acc, det) => {
      const name = det.corrected_class || det.class_name;
      if (!acc[name]) {
        acc[name] = { count: 0, confidences: [], statuses: [] };
      }
      acc[name].count += 1;
      acc[name].confidences.push(det.confidence);
      acc[name].statuses.push(det.verification_status);
      return acc;
    },
    {}
  );

  const averageConfidence =
    detections.length > 0
      ? detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length
      : 0;
  const hasLowConfidence = detections.some((d) => d.confidence < CONFIDENCE_LOW);

  return (
    <div className="border border-reloop-border bg-reloop-surface">
      <div className="border-b border-reloop-border px-4 py-3 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Detection Summary</p>
            <h2 className="mt-2 text-lg font-medium text-reloop-text">AI Candidates</h2>
          </div>
          <div className="rounded-full border border-reloop-border bg-reloop-surface-elevated px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-reloop-text-secondary">
            {detections.length} total
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-3 md:p-5">
        <div className="border border-reloop-border bg-reloop-surface-elevated p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-reloop-text-muted">AI Candidates</p>
          <p className="mt-3 text-4xl font-light tracking-tight text-reloop-text">{detections.length}</p>
        </div>
        <div className="border border-reloop-border bg-reloop-surface-elevated p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-reloop-text-muted">Top Class</p>
          <p className="mt-3 text-lg font-medium text-reloop-text">
            {Object.keys(grouped)[0] || "—"}
          </p>
        </div>
        <div className="border border-reloop-border bg-reloop-surface-elevated p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-reloop-text-muted">Avg Confidence</p>
          <p className="mt-3 text-4xl font-light tracking-tight text-reloop-text">
            {Math.round(averageConfidence * 100)}%
          </p>
        </div>
      </div>

      <div className="divide-y divide-reloop-border border-t border-reloop-border">
        {Object.entries(grouped).map(([name, data]) => (
          <div key={name} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-reloop-border bg-reloop-surface-elevated text-[10px] font-semibold uppercase tracking-[0.18em] text-reloop-text-secondary">
                {data.count > 1 ? `×${data.count}` : name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-reloop-text">{name}</p>
                <p className="text-[11px] text-reloop-text-muted">{data.confidences.map((c) => `${Math.round(c * 100)}%`).join(" • ")}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {(() => {
                const status = getStatusLabel(data.statuses[0]);
                return (
                  <span className={`inline-block rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${status.className}`}>
                    {status.text}
                  </span>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {hasLowConfidence && (
        <div className="border-t border-reloop-border bg-reloop-warning-muted/40 px-4 py-3 md:px-5">
          <p className="text-xs text-reloop-warning">Review required — several AI detections have low confidence.</p>
        </div>
      )}
    </div>
  );
}
