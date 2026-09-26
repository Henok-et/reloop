"use client";

import { useState } from "react";
import { GIZ_CLASSES, CLASS_LABELS } from "@/lib/constants";
import ClassPicker from "./ClassPicker";

interface Props {
  previewUrl: string;
  onManualPick: (className: string) => void;
  onRetake: () => void;
}

/** Nothing found. The photo stays, and the worker can still record the item by hand. */
export default function EmptyDetection({ previewUrl, onManualPick, onRetake }: Props) {
  const [picking, setPicking] = useState(false);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-3">
      <div className="overflow-hidden rounded-lg border border-reloop-border bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
        <img src={previewUrl} alt="Photo with no detected appliance" className="mx-auto max-h-[50vh] w-auto object-contain opacity-80" />
      </div>

      <div className="rounded-lg border border-reloop-border bg-reloop-surface p-4">
        <p className="text-sm font-medium text-reloop-text">No appliance found</p>
        <p className="mt-1 text-xs text-reloop-text-secondary">
          {`Checked for ${GIZ_CLASSES.map((c) => CLASS_LABELS[c]).join(", ")}. Get closer so one item fills the frame, or record it by hand.`}
        </p>

        {!picking ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              id="btn-try-another"
              type="button"
              onClick={onRetake}
              className="rounded bg-reloop-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
            >
              Try another photo
            </button>
            <button
              id="btn-manual-pick"
              type="button"
              onClick={() => setPicking(true)}
              className="rounded border border-reloop-border bg-reloop-surface-elevated px-4 py-2.5 text-sm font-medium text-reloop-text transition-colors hover:bg-reloop-surface-hover"
            >
              Choose class manually
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <ClassPicker title="What is in the photo?" onPick={onManualPick} onCancel={() => setPicking(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
