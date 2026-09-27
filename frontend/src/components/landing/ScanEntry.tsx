import Link from "next/link";
import type { Lot } from "@/lib/types";
import { WORKFLOW_STEPS } from "@/lib/constants";

interface Props {
  /** The open lot with at least one item, or null. */
  activeLot: Lot | null;
}

/**
 * Entry into the existing scan station. Routes, ids, and the resume behaviour
 * are unchanged from the previous landing page; only the presentation is new.
 */
export default function ScanEntry({ activeLot }: Props) {
  return (
    <section id="station" className="scroll-mt-16 border-t border-landing-border px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">Scan station</p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-landing-text md:text-3xl">
          Start with one appliance in the frame.
        </h2>

        {activeLot && (
          <Link
            href="/scan"
            id="resume-lot-btn"
            className="mt-8 flex flex-col gap-3 rounded-xl border border-landing-green/40 bg-landing-green-tag/40 px-5 py-4 transition-colors hover:border-landing-green sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-plex-mono text-[10px] uppercase tracking-[0.2em] text-landing-green-tag-text">
                Lot in progress
              </p>
              <p className="mt-1 text-sm text-landing-text">
                <span className="font-plex-mono">{activeLot.id}</span>
                {` · ${activeLot.items.length} item${activeLot.items.length === 1 ? "" : "s"} · ${activeLot.photo_count} photo${activeLot.photo_count === 1 ? "" : "s"}`}
              </p>
            </div>
            <span className="text-sm font-medium text-landing-green-tag-text">Continue →</span>
          </Link>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/scan?mode=camera"
            id="scan-camera-btn"
            className="group flex flex-col gap-4 rounded-xl border border-landing-border bg-landing-panel p-5 transition-colors hover:border-landing-border-strong hover:bg-landing-panel-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-reloop-green text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-medium text-landing-text">
                {activeLot ? "Start a new photo" : "Open camera"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-landing-dim">
                Frame one appliance and take the shot. The proposal comes back with a box and a score.
              </p>
            </div>
          </Link>

          <Link
            href="/scan?mode=upload"
            id="upload-image-btn"
            className="group flex flex-col gap-4 rounded-xl border border-landing-border bg-landing-panel p-5 transition-colors hover:border-landing-border-strong hover:bg-landing-panel-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-landing-border-strong bg-landing-panel-2 text-landing-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-medium text-landing-text">Upload a photo</p>
              <p className="mt-1 text-sm leading-relaxed text-landing-dim">
                For photos already on the device. JPG, PNG, or WebP up to 10 MB.
              </p>
            </div>
          </Link>
        </div>

        <ol className="mt-10 flex flex-wrap items-center gap-y-3">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step.key} className="flex items-center">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-landing-border-strong font-plex-mono text-[11px] text-landing-dim">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-landing-text">{step.label}</span>
              </span>
              {index < WORKFLOW_STEPS.length - 1 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-3 h-3.5 w-3.5 text-landing-faint"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-landing-dim">
          Guidance appears per item as soon as it is confirmed. Closing a lot gives counts by class and by handling
          group, and a downloadable CSV.
        </p>
      </div>
    </section>
  );
}
