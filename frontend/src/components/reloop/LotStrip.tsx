"use client";

import type { Lot } from "@/lib/types";

interface Props {
  lot: Lot;
  /** Items in the current photo that are confirmed but not yet added to the lot. */
  pendingConfirmed?: number;
  /** Items in the current photo with no decision yet. */
  pendingOpen?: number;
  onCloseLot?: () => void;
}

/** Thin bar that keeps the lot visible on every screen of the station. */
export default function LotStrip({ lot, pendingConfirmed = 0, pendingOpen = 0, onCloseLot }: Props) {
  const total = lot.items.length + pendingConfirmed;
  const photoNumber = lot.photo_count + 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border border-reloop-border bg-reloop-surface px-3 py-2 text-[11px] md:px-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-reloop-text-secondary">{lot.id}</span>
        <span className="text-reloop-text-muted">Photo {photoNumber}</span>
        <span className="text-reloop-text">
          <span className="font-medium">{total}</span> confirmed
        </span>
        {pendingOpen > 0 && (
          <span className="text-reloop-warning">
            <span className="font-medium">{pendingOpen}</span> still open
          </span>
        )}
      </div>
      {onCloseLot && (
        <button
          type="button"
          id="btn-close-lot"
          onClick={onCloseLot}
          disabled={total === 0}
          className="rounded border border-reloop-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-reloop-text-secondary transition-colors hover:border-reloop-border-light hover:text-reloop-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          Close lot
        </button>
      )}
    </div>
  );
}
