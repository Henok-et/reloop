/**
 * Lot persistence.
 *
 * A lot is a batch of verified items collected across several photos.
 * The active lot lives in localStorage so a page reload does not lose work.
 * Closed lots are appended to a history list. Photos are never stored.
 */

import { useMemo, useSyncExternalStore } from "react";
import type { HandlingGroup, Lot, LotItem, LotItemSource } from "./types";
import { HANDLING_GROUPS, classLabel, handlingGroupFor } from "./constants";

const ACTIVE_KEY = "reloop_active_lot";
const HISTORY_KEY = "reloop_lots";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// ── Change notification (so React can subscribe to the active lot) ─────────────

const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readActiveRaw(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function parseLot(raw: string | null): Lot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Lot;
    return parsed && Array.isArray(parsed.items) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * The active lot as React state. `undefined` while rendering on the server
 * and during hydration, `null` when there is no active lot, else the lot.
 */
export function useStoredActiveLot(): Lot | null | undefined {
  const raw = useSyncExternalStore(
    subscribe,
    readActiveRaw,
    () => undefined
  );
  return useMemo(() => (raw === undefined ? undefined : parseLot(raw)), [raw]);
}

function shortId(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${time}${rand}`;
}

export function newLot(): Lot {
  return {
    id: shortId("LOT"),
    started_at: new Date().toISOString(),
    closed_at: null,
    photo_count: 0,
    items: [],
    worker: "",
    site: "",
  };
}

export function loadActiveLot(): Lot | null {
  return parseLot(readActiveRaw());
}

export function saveActiveLot(lot: Lot): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(lot));
  } catch {
    // Storage full or blocked. Nothing else to do; the UI will show what it can.
  }
  emitChange();
}

export function clearActiveLot(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACTIVE_KEY);
  emitChange();
}

export function loadLotHistory(): Lot[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Lot[]) : [];
  } catch {
    return [];
  }
}

export interface NewLotItemInput {
  class_name: string;
  source: LotItemSource;
  detected_class: string | null;
  confidence: number | null;
}

export function makeLotItem(lot: Lot, photoIndex: number, input: NewLotItemInput): LotItem {
  return {
    id: shortId("ITM"),
    lot_id: lot.id,
    class_name: input.class_name,
    handling_group: handlingGroupFor(input.class_name),
    source: input.source,
    detected_class: input.detected_class,
    confidence: input.confidence,
    photo_index: photoIndex,
    recorded_at: new Date().toISOString(),
  };
}

export function closeLot(lot: Lot): Lot {
  const closed: Lot = { ...lot, closed_at: new Date().toISOString() };
  if (canUseStorage()) {
    try {
      const history = loadLotHistory();
      history.unshift(closed);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
    clearActiveLot();
  }
  return closed;
}

// ── Summaries ──────────────────────────────────────────────────────────────────

export interface LotSummary {
  total: number;
  byClass: { class_name: string; label: string; count: number }[];
  byGroup: { group: HandlingGroup; label: string; count: number }[];
  manualCount: number;
  correctedCount: number;
}

export function summarizeLot(lot: Lot): LotSummary {
  const classCounts = new Map<string, number>();
  const groupCounts = new Map<HandlingGroup, number>();
  let manualCount = 0;
  let correctedCount = 0;

  for (const item of lot.items) {
    classCounts.set(item.class_name, (classCounts.get(item.class_name) ?? 0) + 1);
    groupCounts.set(item.handling_group, (groupCounts.get(item.handling_group) ?? 0) + 1);
    if (item.source === "manual") manualCount += 1;
    if (item.source === "ai_corrected") correctedCount += 1;
  }

  const byClass = Array.from(classCounts.entries())
    .map(([class_name, count]) => ({ class_name, label: classLabel(class_name), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const byGroup = (Object.keys(HANDLING_GROUPS) as HandlingGroup[])
    .map((group) => ({ group, label: HANDLING_GROUPS[group].label, count: groupCounts.get(group) ?? 0 }))
    .filter((g) => g.count > 0);

  return { total: lot.items.length, byClass, byGroup, manualCount, correctedCount };
}

// ── Export ─────────────────────────────────────────────────────────────────────

function csvCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function lotToCsv(lot: Lot): string {
  const header = [
    "lot_id",
    "item_id",
    "class",
    "handling_group",
    "source",
    "detected_class",
    "confidence",
    "photo_index",
    "recorded_at",
    "worker",
    "site",
  ];
  const rows = lot.items.map((item) =>
    [
      lot.id,
      item.id,
      item.class_name,
      item.handling_group,
      item.source,
      item.detected_class,
      item.confidence === null ? null : Math.round(item.confidence * 100),
      item.photo_index,
      item.recorded_at,
      lot.worker,
      lot.site,
    ]
      .map(csvCell)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}
