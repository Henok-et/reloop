"use client";

import Link from "next/link";
import { WORKFLOW_STEPS } from "@/lib/constants";
import { useStoredActiveLot } from "@/lib/lot";

export default function HomePage() {
  const storedLot = useStoredActiveLot();
  const activeLot = storedLot && storedLot.items.length > 0 ? storedLot : null;

  return (
    <main className="flex min-h-dvh flex-col">
      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="border-b border-reloop-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-reloop-green">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-reloop-text">ReLoop</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-xs text-reloop-text-secondary transition-colors hover:text-reloop-text"
            >
              About
            </Link>
            <span className="hidden text-xs text-reloop-text-muted sm:block">Phase 1 Prototype</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl animate-fade-in text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-reloop-text md:text-5xl">RELOOP</h1>
          <p className="mb-2 text-base text-reloop-text-secondary md:text-lg">
            Photograph an appliance. Confirm what it is. Know where it goes.
          </p>
          <p className="mx-auto mb-10 max-w-md text-sm text-reloop-text-muted">
            AI proposes one of seven e-waste classes, the worker decides, and confirmed items build up in a lot
            you can close and hand over.
          </p>

          {activeLot && (
            <Link
              href="/scan"
              id="resume-lot-btn"
              className="mb-6 inline-flex w-full items-center justify-between gap-3 rounded-lg border border-reloop-green/30 bg-reloop-green-muted px-5 py-3.5 text-left transition-colors hover:border-reloop-green/50 sm:w-auto sm:min-w-[24rem]"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-green-light">Lot in progress</p>
                <p className="mt-0.5 text-sm text-reloop-text">
                  <span className="font-mono">{activeLot.id}</span>
                  {` · ${activeLot.items.length} item${activeLot.items.length === 1 ? "" : "s"} · ${activeLot.photo_count} photo${activeLot.photo_count === 1 ? "" : "s"}`}
                </p>
              </div>
              <span className="text-sm font-medium text-reloop-green-light">Continue →</span>
            </Link>
          )}

          {/* Primary Actions */}
          <div className="mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/scan?mode=camera"
              id="scan-camera-btn"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-reloop-green px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-reloop-green-light hover:shadow-lg hover:shadow-reloop-green/20 sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              {activeLot ? "Start a new photo" : "Open camera"}
            </Link>
            <Link
              href="/scan?mode=upload"
              id="upload-image-btn"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-reloop-border bg-reloop-surface-elevated px-8 py-3.5 text-sm font-medium text-reloop-text transition-all duration-200 hover:bg-reloop-surface-hover sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload a photo
            </Link>
          </div>

          {/* Workflow Strip */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <p className="mb-4 text-xs uppercase tracking-widest text-reloop-text-muted">How a lot is built</p>
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-0">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center">
                  <span className="rounded bg-reloop-green-muted px-2 py-1 text-xs font-medium tracking-wide text-reloop-green-light">
                    {step.label}
                  </span>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mx-1 hidden h-3 w-3 text-reloop-text-muted md:block"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-reloop-text-muted">
              Guidance appears per item as soon as it is confirmed. Closing a lot gives counts by class and by
              handling group.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-reloop-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-reloop-text-muted">
          <span>ReLoop Phase 1</span>
          <Link href="/about" className="transition-colors hover:text-reloop-text-secondary">
            About the data, the score, and the lot
          </Link>
        </div>
      </footer>
    </main>
  );
}
