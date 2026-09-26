"use client";

import { useState } from "react";
import type { ReviewItem } from "@/lib/types";
import {
  HANDLING_GUIDANCE,
  HANDLING_GROUPS,
  classLabel,
  handlingGroupFor,
  needsReview,
} from "@/lib/constants";
import ClassPicker from "./ClassPicker";
import GroupTag from "./GroupTag";

interface Props {
  index: number;
  item: ReviewItem;
  selected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
  onCorrect: (className: string) => void;
  onReject: () => void;
  onReopen: () => void;
}

/**
 * One proposal, one decision. Handling notes for the class appear on the card
 * as soon as it is confirmed or corrected, so the worker never waits on other items.
 */
export default function ItemCard({
  index,
  item,
  selected,
  onSelect,
  onConfirm,
  onCorrect,
  onReject,
  onReopen,
}: Props) {
  const [picking, setPicking] = useState(false);

  const decided = item.status === "confirmed" || item.status === "corrected";
  const finalClass = item.final_class || item.class_name;
  const group = handlingGroupFor(finalClass);
  const pct = Math.round(item.confidence * 100);
  const review = needsReview(item.confidence);
  const guidance = HANDLING_GUIDANCE[finalClass];

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border bg-reloop-surface transition-colors ${
        selected ? "border-reloop-border-light" : "border-reloop-border"
      } ${item.status === "rejected" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-reloop-text-muted">{index + 1}</span>
            <span className={`text-base font-medium ${item.status === "rejected" ? "line-through text-reloop-text-muted" : "text-reloop-text"}`}>
              {classLabel(finalClass)}
            </span>
            {item.status === "corrected" && (
              <span className="text-[11px] text-reloop-text-muted">
                was <span className="line-through">{classLabel(item.class_name)}</span>
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={review ? "text-reloop-warning" : "text-reloop-text-secondary"}>
              {pct}% {review && "· check closely"}
            </span>
            {decided && <GroupTag group={group} />}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.status === "open" && !picking && (
        <div className="grid grid-cols-3 gap-1.5 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <button
            id={`btn-confirm-${index}`}
            type="button"
            onClick={onConfirm}
            className="rounded bg-reloop-green px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-reloop-green-light"
          >
            Confirm
          </button>
          <button
            id={`btn-correct-${index}`}
            type="button"
            onClick={() => setPicking(true)}
            className="rounded border border-reloop-border bg-reloop-surface-elevated px-3 py-2.5 text-xs font-medium text-reloop-text transition-colors hover:bg-reloop-surface-hover"
          >
            Wrong class
          </button>
          <button
            id={`btn-reject-${index}`}
            type="button"
            onClick={onReject}
            className="rounded border border-reloop-border px-3 py-2.5 text-xs font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
          >
            Not this
          </button>
        </div>
      )}

      {item.status === "open" && picking && (
        <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <ClassPicker
            currentClass={item.class_name}
            onPick={(cls) => {
              setPicking(false);
              onCorrect(cls);
            }}
            onCancel={() => setPicking(false)}
          />
        </div>
      )}

      {decided && guidance && (
        <div className="border-t border-reloop-border px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <p className={`text-xs font-medium ${group === "refrigerant" ? "text-reloop-cool-light" : "text-reloop-green-light"}`}>
            {HANDLING_GROUPS[group].sortInstruction}
          </p>
          <ul className="mt-2 space-y-1">
            {guidance.precautions.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[11px] leading-relaxed text-reloop-text-secondary">
                <span className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-reloop-text-muted" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onReopen}
            className="mt-2 text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted transition-colors hover:text-reloop-text-secondary"
          >
            Change
          </button>
        </div>
      )}

      {item.status === "rejected" && (
        <div className="flex items-center justify-between border-t border-reloop-border px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <p className="text-[11px] text-reloop-text-muted">Will not be recorded.</p>
          <button
            type="button"
            onClick={onReopen}
            className="text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted transition-colors hover:text-reloop-text-secondary"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewItem["status"] }) {
  const base = "flex-shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em]";
  switch (status) {
    case "confirmed":
      return <span className={`${base} border-reloop-green/20 bg-reloop-green-muted text-reloop-green-light`}>Confirmed</span>;
    case "corrected":
      return <span className={`${base} border-reloop-green/20 bg-reloop-green-muted text-reloop-green-light`}>Corrected</span>;
    case "rejected":
      return <span className={`${base} border-reloop-border text-reloop-text-muted`}>Dropped</span>;
    default:
      return <span className={`${base} border-reloop-border bg-reloop-surface-elevated text-reloop-text-muted`}>Proposed</span>;
  }
}
