"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DetectionWorkspace from "@/components/reloop/DetectionWorkspace";
import Link from "next/link";

function ScanContent() {
  const params = useSearchParams();
  // Camera is the default at the station; upload is for photos already taken.
  const initialMode = params.get("mode") === "upload" ? "upload" : "camera";

  return (
    <main className="min-h-dvh flex flex-col bg-reloop-black">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="border-b border-reloop-border px-4 md:px-6 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-reloop-text-secondary hover:text-reloop-text transition-colors"
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-reloop-green flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3 text-white"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
                </svg>
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase">ReLoop</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-xs text-reloop-text-secondary transition-colors hover:text-reloop-text"
            >
              About
            </Link>
            <span className="text-xs text-reloop-text-muted">Scan station</span>
          </div>
        </div>
      </nav>

      {/* ── Detection Workspace ─────────────────────────────────── */}
      <div className="flex-1">
        <DetectionWorkspace initialMode={initialMode} />
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-reloop-black">
          <div className="animate-spin-slow w-8 h-8 border-2 border-reloop-border border-t-reloop-green rounded-full" />
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
