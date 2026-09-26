"use client";

import { useEffect, useState } from "react";
import { EXPECTED_ANALYSIS_SECONDS } from "@/lib/constants";

interface Props {
  previewUrl: string;
  onCancel: () => void;
}

/**
 * Keeps the photo visible while inference runs, shows elapsed time against
 * the usual duration, and lets the worker cancel.
 */
export default function ProcessingState({ previewUrl, onCancel }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250);
    return () => clearInterval(timer);
  }, []);

  const progress = Math.min(0.95, elapsed / EXPECTED_ANALYSIS_SECONDS);
  const overdue = elapsed > EXPECTED_ANALYSIS_SECONDS;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-reloop-border bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
        <img
          src={previewUrl}
          alt="Photo being analyzed"
          className="mx-auto max-h-[62vh] w-auto object-contain opacity-60"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="animate-scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-reloop-green-light to-transparent" />
        </div>
      </div>

      <div className="rounded-lg border border-reloop-border bg-reloop-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-reloop-text">Looking for appliances…</p>
            <p className="mt-0.5 text-xs text-reloop-text-muted">
              {overdue
                ? "Taking longer than usual. The service may be waking up."
                : `This usually takes up to ${EXPECTED_ANALYSIS_SECONDS} seconds.`}
            </p>
          </div>
          <p className="font-mono text-2xl font-light tabular-nums text-reloop-text">
            {elapsed}
            <span className="ml-0.5 text-xs text-reloop-text-muted">s</span>
          </p>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-reloop-surface-elevated">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${overdue ? "bg-reloop-warning" : "bg-reloop-green"}`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            id="btn-cancel-analysis"
            type="button"
            onClick={onCancel}
            className="text-xs text-reloop-text-muted transition-colors hover:text-reloop-text"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
