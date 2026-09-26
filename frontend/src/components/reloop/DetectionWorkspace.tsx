"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppPhase, CaptureMode, Lot, LotItem, PredictionResponse, ReviewItem } from "@/lib/types";
import { isAbortError, predictImage } from "@/lib/api";
import { classLabel, needsReview } from "@/lib/constants";
import { closeLot, makeLotItem, newLot, saveActiveLot, useStoredActiveLot } from "@/lib/lot";
import CaptureStage from "./CaptureStage";
import PreviewStage from "./PreviewStage";
import ProcessingState from "./ProcessingState";
import DetectionCanvas from "./DetectionCanvas";
import ItemCard from "./ItemCard";
import EmptyDetection from "./EmptyDetection";
import LotStrip from "./LotStrip";
import LotSummary from "./LotSummary";
import ClassPicker from "./ClassPicker";

interface Props {
  initialMode: CaptureMode;
}

/**
 * The station. One photo at a time; confirmed items accumulate in a lot that
 * survives reloads. Sort/handover happens when the lot is closed.
 */
export default function DetectionWorkspace({ initialMode }: Props) {
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [phase, setPhase] = useState<AppPhase>("capture");

  // The active lot lives in localStorage; this component reads it as an external store.
  const storedLot = useStoredActiveLot();
  const lot: Lot | null = storedLot ?? null;
  const [closedLot, setClosedLot] = useState<Lot | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualPickOpen, setManualPickOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Lot lifecycle ────────────────────────────────────────────────────────────

  // No active lot on this device yet: create one. Writing to storage notifies the hook above.
  useEffect(() => {
    if (storedLot === null && phase !== "lot_summary") saveActiveLot(newLot());
  }, [storedLot, phase]);

  const updateLot = useCallback((next: Lot) => {
    saveActiveLot(next);
  }, []);

  const photoIndex = (lot?.photo_count ?? 0) + 1;

  // ── Photo lifecycle ──────────────────────────────────────────────────────────

  const clearPhoto = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setItems([]);
    setSelectedIndex(null);
    setError(null);
  }, [imagePreview]);

  const handleImage = useCallback(
    (file: File) => {
      clearPhoto();
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPhase("preview");
    },
    [clearPhoto]
  );

  const backToCapture = useCallback(() => {
    clearPhoto();
    setPhase("capture");
  }, [clearPhoto]);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("analyzing");
    setError(null);

    try {
      const response = await predictImage(imageFile, controller.signal);
      if (controller.signal.aborted) return;

      setResult(response);
      const proposals: ReviewItem[] = response.detections.map((d) => ({ ...d, status: "open" }));
      setItems(proposals);
      setSelectedIndex(proposals.length > 0 ? 0 : null);
      setPhase("review");
    } catch (err) {
      if (isAbortError(err)) {
        setPhase("preview");
        return;
      }
      setError(err instanceof Error ? err.message : "Detection failed. Please try again.");
      setPhase("error");
    } finally {
      abortRef.current = null;
    }
  }, [imageFile]);

  const handleCancelAnalyze = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Decisions on the current photo ───────────────────────────────────────────

  const setItem = useCallback((index: number, patch: Partial<ReviewItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }, []);

  const advanceSelection = useCallback(
    (from: number) => {
      const nextOpen = items.findIndex((it, i) => i > from && it.status === "open");
      const anyOpen = items.findIndex((it) => it.status === "open");
      setSelectedIndex(nextOpen !== -1 ? nextOpen : anyOpen !== -1 ? anyOpen : from);
    },
    [items]
  );

  const confirmItem = (i: number) => {
    setItem(i, { status: "confirmed", final_class: items[i].class_name });
    advanceSelection(i);
  };
  const correctItem = (i: number, cls: string) => {
    setItem(i, { status: "corrected", final_class: cls });
    advanceSelection(i);
  };
  const rejectItem = (i: number) => {
    setItem(i, { status: "rejected", final_class: undefined });
    advanceSelection(i);
  };
  const reopenItem = (i: number) => {
    setItem(i, { status: "open", final_class: undefined });
    setSelectedIndex(i);
  };

  const decidedItems = useMemo(
    () => items.filter((it) => it.status === "confirmed" || it.status === "corrected"),
    [items]
  );
  const openCount = items.filter((it) => it.status === "open").length;

  // ── Committing to the lot ────────────────────────────────────────────────────

  const commitCurrentPhoto = useCallback((): Lot | null => {
    if (!lot) return null;
    if (!result) return lot;

    const newItems: LotItem[] = decidedItems.map((it) =>
      makeLotItem(lot, photoIndex, {
        class_name: it.final_class || it.class_name,
        source: it.status === "corrected" ? "ai_corrected" : "ai_confirmed",
        detected_class: it.class_name,
        confidence: it.confidence,
      })
    );

    const next: Lot = {
      ...lot,
      photo_count: lot.photo_count + 1,
      items: [...lot.items, ...newItems],
    };
    updateLot(next);
    return next;
  }, [decidedItems, lot, photoIndex, result, updateLot]);

  const handleNextPhoto = useCallback(() => {
    commitCurrentPhoto();
    backToCapture();
  }, [backToCapture, commitCurrentPhoto]);

  const handleManualAdd = useCallback(
    (cls: string, countsAsPhoto: boolean) => {
      if (!lot) return;
      const item = makeLotItem(lot, countsAsPhoto ? photoIndex : lot.photo_count, {
        class_name: cls,
        source: "manual",
        detected_class: null,
        confidence: null,
      });
      updateLot({
        ...lot,
        photo_count: countsAsPhoto ? lot.photo_count + 1 : lot.photo_count,
        items: [...lot.items, item],
      });
      setLastAdded(classLabel(cls));
      setManualPickOpen(false);
      if (countsAsPhoto) backToCapture();
    },
    [backToCapture, lot, photoIndex, updateLot]
  );

  const handleCloseLot = useCallback(() => {
    const current = phase === "review" ? commitCurrentPhoto() : lot;
    if (!current) return;
    const closed = closeLot(current);
    setClosedLot(closed);
    clearPhoto();
    setPhase("lot_summary");
  }, [clearPhoto, commitCurrentPhoto, lot, phase]);

  const handleStartNewLot = useCallback(() => {
    const fresh = newLot();
    updateLot(fresh);
    setClosedLot(null);
    setLastAdded(null);
    setPhase("capture");
  }, [updateLot]);

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => setLastAdded(null), 3500);
    return () => clearTimeout(t);
  }, [lastAdded]);

  // ── Derived copy ─────────────────────────────────────────────────────────────

  const headline = useMemo(() => {
    if (items.length === 0) return "";
    const parts = items.map((it) => `${classLabel(it.class_name)} ${Math.round(it.confidence * 100)}%`);
    return `${items.length} item${items.length === 1 ? "" : "s"} — ${parts.join(", ")}`;
  }, [items]);

  const lowScoreCount = items.filter((it) => it.status === "open" && needsReview(it.confidence)).length;

  if (phase === "lot_summary" && closedLot) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <LotSummary lot={closedLot} onStartNewLot={handleStartNewLot} />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-reloop-border border-t-reloop-green" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pt-6">
      <div className="mb-4">
        <LotStrip
          lot={lot}
          pendingConfirmed={phase === "review" ? decidedItems.length : 0}
          pendingOpen={phase === "review" ? openCount : 0}
          onCloseLot={handleCloseLot}
        />
        {lastAdded && (
          <p className="mt-2 animate-fade-in text-xs text-reloop-green-light">Added {lastAdded} to the lot.</p>
        )}
      </div>

      {phase === "capture" && !manualPickOpen && (
        <CaptureStage
          mode={mode}
          onModeChange={setMode}
          onImage={handleImage}
          onAddManually={() => setManualPickOpen(true)}
        />
      )}

      {phase === "capture" && manualPickOpen && (
        <div className="mx-auto max-w-2xl rounded-lg border border-reloop-border bg-reloop-surface p-4">
          <ClassPicker
            title="Add an item without a photo"
            onPick={(cls) => handleManualAdd(cls, false)}
            onCancel={() => setManualPickOpen(false)}
          />
        </div>
      )}

      {phase === "preview" && imageFile && imagePreview && (
        <PreviewStage file={imageFile} previewUrl={imagePreview} onAnalyze={handleAnalyze} onRetake={backToCapture} />
      )}

      {phase === "analyzing" && imagePreview && (
        <ProcessingState previewUrl={imagePreview} onCancel={handleCancelAnalyze} />
      )}

      {phase === "error" && (
        <div className="mx-auto max-w-2xl animate-fade-in space-y-3">
          {imagePreview && (
            <div className="overflow-hidden rounded-lg border border-reloop-border bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
              <img src={imagePreview} alt="Photo that could not be analyzed" className="mx-auto max-h-[40vh] w-auto object-contain opacity-60" />
            </div>
          )}
          <div className="rounded-lg border border-reloop-error/30 bg-reloop-surface p-4">
            <p className="text-sm font-medium text-reloop-text">Could not analyze</p>
            <p className="mt-1 text-xs text-reloop-text-secondary">{error}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                id="btn-retry"
                type="button"
                onClick={handleAnalyze}
                className="rounded bg-reloop-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={backToCapture}
                className="rounded border border-reloop-border px-4 py-2.5 text-sm font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
              >
                Another photo
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "review" && result && imagePreview && items.length === 0 && (
        <EmptyDetection
          previewUrl={imagePreview}
          onManualPick={(cls) => handleManualAdd(cls, true)}
          onRetake={handleNextPhoto}
        />
      )}

      {phase === "review" && result && imagePreview && items.length > 0 && (
        <div className="animate-fade-in space-y-4">
          <div>
            <h1 className="text-lg font-medium leading-snug text-reloop-text md:text-xl">{headline}</h1>
            <p className="mt-1 text-xs text-reloop-text-muted">
              {openCount === 0
                ? "All items decided."
                : `Tap a box or a card. Confirm, fix the class, or drop it.${
                    lowScoreCount > 0 ? ` ${lowScoreCount} low score${lowScoreCount === 1 ? "" : "s"} to check closely.` : ""
                  }`}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="lg:sticky lg:top-4 lg:self-start">
              <DetectionCanvas
                imageSrc={imagePreview}
                items={items}
                imageWidth={result.image_width}
                imageHeight={result.image_height}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            </div>

            <div className="space-y-2.5">
              {items.map((item, i) => (
                <ItemCard
                  key={`${item.class_id}-${i}`}
                  index={i}
                  item={item}
                  selected={selectedIndex === i}
                  onSelect={() => setSelectedIndex(i)}
                  onConfirm={() => confirmItem(i)}
                  onCorrect={(cls) => correctItem(i, cls)}
                  onReject={() => rejectItem(i)}
                  onReopen={() => reopenItem(i)}
                />
              ))}

              {!manualPickOpen ? (
                <button
                  type="button"
                  onClick={() => setManualPickOpen(true)}
                  className="w-full rounded-lg border border-dashed border-reloop-border px-4 py-3 text-xs text-reloop-text-muted transition-colors hover:border-reloop-border-light hover:text-reloop-text-secondary"
                >
                  + Missed something? Add it by hand
                </button>
              ) : (
                <div className="rounded-lg border border-reloop-border bg-reloop-surface p-4">
                  <ClassPicker
                    title="Add an item the model missed"
                    onPick={(cls) => handleManualAdd(cls, false)}
                    onCancel={() => setManualPickOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky action bar during review */}
      {phase === "review" && items.length > 0 && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-reloop-border bg-reloop-black/95 px-4 pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="text-xs text-reloop-text-secondary">
              <span className="font-medium text-reloop-text">{decidedItems.length}</span> to record
              {openCount > 0 && (
                <>
                  {" · "}
                  <span className="text-reloop-warning">{openCount} open</span>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseLot}
                className="rounded border border-reloop-border px-4 py-2.5 text-sm font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
              >
                Close lot
              </button>
              <button
                id="btn-next-photo"
                type="button"
                onClick={handleNextPhoto}
                className="rounded bg-reloop-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
                title={openCount > 0 ? "Open items will not be recorded" : undefined}
              >
                Next photo
              </button>
            </div>
          </div>
          {openCount > 0 && (
            <p className="mx-auto mt-1.5 max-w-6xl text-[11px] text-reloop-text-muted">
              Open items are dropped when you move on.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
