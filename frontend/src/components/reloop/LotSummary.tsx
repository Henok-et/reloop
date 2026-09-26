"use client";

import type { Lot } from "@/lib/types";
import { AI_LIMITATIONS_NOTE, HANDLING_GROUPS } from "@/lib/constants";
import { lotToCsv, summarizeLot } from "@/lib/lot";
import GroupTag from "./GroupTag";

interface Props {
  lot: Lot;
  onStartNewLot: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadCsv(lot: Lot) {
  const blob = new Blob([lotToCsv(lot)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${lot.id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** The closed lot: counts by class and by handling group, ready to hand over. */
export default function LotSummary({ lot, onStartNewLot }: Props) {
  const summary = summarizeLot(lot);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-4">
      <div className="rounded-lg border border-reloop-border bg-reloop-surface">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-reloop-border p-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-text-muted">Lot closed</p>
            <h1 className="mt-1 font-mono text-2xl font-medium tracking-tight text-reloop-text">{lot.id}</h1>
          </div>
          <div className="text-right text-[11px] text-reloop-text-muted">
            <p>{formatTime(lot.started_at)} → {formatTime(lot.closed_at)}</p>
            <p>
              {lot.photo_count} photo{lot.photo_count === 1 ? "" : "s"}
              {lot.worker && ` · ${lot.worker}`}
              {lot.site && ` · ${lot.site}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-reloop-border sm:grid-cols-3">
          <div className="bg-reloop-surface p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Items</p>
            <p className="mt-2 text-4xl font-light tabular-nums text-reloop-text">{summary.total}</p>
          </div>
          {summary.byGroup.map((g) => (
            <div key={g.group} className="bg-reloop-surface p-4">
              <GroupTag group={g.group} />
              <p className="mt-2 text-4xl font-light tabular-nums text-reloop-text">{g.count}</p>
              <p className="mt-1 text-[11px] leading-snug text-reloop-text-muted">
                {HANDLING_GROUPS[g.group].sortInstruction}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-reloop-border">
          <p className="px-4 pt-3 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">By class</p>
          <ul className="divide-y divide-reloop-border">
            {summary.byClass.map((c) => (
              <li key={c.class_name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-reloop-text">{c.label}</span>
                <span className="font-mono tabular-nums text-reloop-text-secondary">{c.count}</span>
              </li>
            ))}
            {summary.byClass.length === 0 && (
              <li className="px-4 py-3 text-xs text-reloop-text-muted">No items were recorded in this lot.</li>
            )}
          </ul>
        </div>

        {(summary.manualCount > 0 || summary.correctedCount > 0) && (
          <p className="border-t border-reloop-border px-4 py-2.5 text-[11px] text-reloop-text-muted">
            {summary.correctedCount > 0 && `${summary.correctedCount} corrected by the worker. `}
            {summary.manualCount > 0 && `${summary.manualCount} added without a detection.`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-download-csv"
          type="button"
          onClick={() => downloadCsv(lot)}
          disabled={summary.total === 0}
          className="rounded border border-reloop-border bg-reloop-surface-elevated px-4 py-3 text-sm font-medium text-reloop-text transition-colors hover:bg-reloop-surface-hover disabled:opacity-40"
        >
          Download CSV
        </button>
        <button
          id="btn-new-lot"
          type="button"
          onClick={onStartNewLot}
          className="rounded bg-reloop-green px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
        >
          Start new lot
        </button>
      </div>

      <p className="text-[10px] leading-relaxed text-reloop-text-muted">{AI_LIMITATIONS_NOTE}</p>
    </div>
  );
}
