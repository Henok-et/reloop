"use client";

import { GIZ_CLASSES, CLASS_LABELS, CLASS_HANDLING_GROUP } from "@/lib/constants";
import GroupTag from "./GroupTag";

interface Props {
  /** Class to visually de-emphasise (e.g. the one the model proposed). */
  currentClass?: string;
  onPick: (className: string) => void;
  onCancel?: () => void;
  title?: string;
}

/** The seven GIZ classes, grouped by handling decision. Used for corrections and manual adds. */
export default function ClassPicker({ currentClass, onPick, onCancel, title = "Which is it?" }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">{title}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted transition-colors hover:text-reloop-text-secondary"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {GIZ_CLASSES.map((cls) => {
          const isCurrent = cls === currentClass;
          return (
            <button
              key={cls}
              type="button"
              onClick={() => onPick(cls)}
              disabled={isCurrent}
              className={`flex flex-col items-start gap-1.5 rounded border px-3 py-2.5 text-left transition-colors ${
                isCurrent
                  ? "cursor-default border-reloop-border bg-reloop-surface text-reloop-text-muted"
                  : "border-reloop-border bg-reloop-surface-elevated text-reloop-text hover:border-reloop-border-light hover:bg-reloop-surface-hover"
              }`}
            >
              <span className="text-sm font-medium">{CLASS_LABELS[cls]}</span>
              <GroupTag group={CLASS_HANDLING_GROUP[cls]} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
