"use client";

import { WORKFLOW_STEPS } from "@/lib/constants";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="border-b border-reloop-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-reloop-green flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wider text-reloop-text uppercase">
              ReLoop
            </span>
          </div>
          <span className="text-xs text-reloop-text-muted hidden sm:block">Phase 1 Prototype</span>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          {/* Logo mark */}
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-reloop-green/10 border border-reloop-green/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-reloop-green-light"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-reloop-text mb-3">
            RELOOP
          </h1>
          <p className="text-base md:text-lg text-reloop-text-secondary mb-2">
            AI-Assisted E-Waste Tracking &amp; Circular Guidance
          </p>
          <p className="text-sm text-reloop-text-muted max-w-md mx-auto mb-12">
            Identify, verify and route electronic waste with AI-assisted visual detection.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/scan?mode=camera"
              id="scan-camera-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-reloop-green hover:bg-reloop-green-light text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-reloop-green/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Scan with Camera
            </Link>
            <Link
              href="/scan?mode=upload"
              id="upload-image-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-reloop-surface-elevated hover:bg-reloop-surface-hover border border-reloop-border text-reloop-text font-medium text-sm transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Image
            </Link>
          </div>

          {/* Workflow Strip */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <p className="text-xs text-reloop-text-muted uppercase tracking-widest mb-4">
              Workflow
            </p>
            <div className="flex items-center justify-center flex-wrap gap-1 md:gap-0">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center">
                  <span
                    className={`text-xs font-medium tracking-wide px-2 py-1 rounded ${
                      i <= 3
                        ? "text-reloop-green-light bg-reloop-green-muted"
                        : "text-reloop-text-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3 text-reloop-text-muted mx-1 hidden md:block"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-reloop-text-muted mt-3">
              Phase 1: Collect → Identify → Verify → Guide
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-reloop-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs text-reloop-text-muted">
          <span>ReLoop Phase 1 — GIZ E-Waste Database</span>
          <span>AI-Assisted Detection Prototype</span>
        </div>
      </footer>
    </main>
  );
}
