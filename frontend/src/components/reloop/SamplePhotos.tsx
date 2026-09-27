"use client";

import Image from "next/image";
import { useState } from "react";
import { SAMPLE_PHOTOS } from "@/lib/constants";

interface Props {
  onImage: (file: File) => void;
}

/**
 * Two real yard photos. Picking one fetches it and hands it to the station
 * as a File, so it follows the exact path an uploaded photo takes.
 */
export default function SamplePhotos({ onImage }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (sample: (typeof SAMPLE_PHOTOS)[number]) => {
    setError(null);
    setLoading(sample.src);
    try {
      const res = await fetch(sample.src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      onImage(new File([blob], sample.file, { type: blob.type || "image/jpeg" }));
    } catch {
      setError("Could not load the sample photo. Try again or choose your own.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">No appliance at hand? Try a sample</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SAMPLE_PHOTOS.map((sample) => {
          const busy = loading === sample.src;
          return (
            <button
              key={sample.src}
              type="button"
              id={`btn-sample-${sample.file.replace(/\.[^.]+$/, "")}`}
              onClick={() => pick(sample)}
              disabled={loading !== null}
              className="group flex items-center gap-3 rounded-lg border border-reloop-border bg-reloop-surface p-2 text-left transition-colors hover:border-reloop-border-light hover:bg-reloop-surface-hover disabled:cursor-wait disabled:opacity-70"
            >
              <Image
                src={sample.src}
                alt=""
                width={sample.width}
                height={sample.height}
                sizes="96px"
                className="h-16 w-16 shrink-0 rounded object-cover"
              />
              <span className="min-w-0">
                <span className="block text-sm text-reloop-text">{busy ? "Loading…" : sample.label}</span>
                <span className="block text-[11px] leading-snug text-reloop-text-muted">{sample.note}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-reloop-error">{error}</p>}
    </div>
  );
}
