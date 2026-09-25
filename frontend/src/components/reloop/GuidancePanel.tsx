"use client";

import type { VerifiedDetection } from "@/lib/types";
import { HANDLING_GUIDANCE } from "@/lib/constants";

interface Props {
  detections: VerifiedDetection[];
}

export default function GuidancePanel({ detections }: Props) {
  const uniqueClasses = Array.from(
    new Set(detections.map((d) => d.corrected_class || d.class_name))
  );

  return (
    <div className="overflow-hidden border border-reloop-border bg-reloop-surface">
      <div className="border-b border-reloop-border px-4 py-3 md:px-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Handling Guidance</p>
        <h2 className="mt-2 text-lg font-medium text-reloop-text">Operational Guidance</h2>
        <p className="mt-2 text-xs text-reloop-text-muted">
          Contextual guidance based on verified classifications. Always follow local procedures.
        </p>
      </div>

      <div className="divide-y divide-reloop-border">
        {uniqueClasses.map((className) => {
          const guidance = HANDLING_GUIDANCE[className];
          if (!guidance) return null;

          return (
            <div key={className} className="px-4 py-4 md:px-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-reloop-green/20 bg-reloop-green-muted text-[10px] font-semibold uppercase tracking-[0.2em] text-reloop-green-light">
                  {className.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-reloop-text">{guidance.title}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Recovery & controlled handling</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-reloop-text-secondary">{guidance.guidance}</p>

              <div className="mt-3 space-y-2">
                {guidance.precautions.map((precaution, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-reloop-warning" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-reloop-text-muted">{precaution}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-reloop-border bg-reloop-surface-elevated/50 px-4 py-3 text-[10px] leading-relaxed text-reloop-text-muted md:px-5">
        AI-based image detection alone cannot determine hazardous substances, refrigerant presence, battery condition,
        electrical safety, or recyclability certification. Always follow applicable local regulations and safety procedures.
      </div>
    </div>
  );
}
