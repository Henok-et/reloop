"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { VerifiedDetection } from "@/lib/types";
import { CONFIDENCE_LOW, CONFIDENCE_MEDIUM } from "@/lib/constants";

interface Props {
  imageSrc: string;
  detections: VerifiedDetection[];
  imageWidth: number;
  imageHeight: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= CONFIDENCE_MEDIUM) return "#5a9a6a";
  if (confidence >= CONFIDENCE_LOW) return "#c4953a";
  return "#b54a4a";
}

function getVerificationBorderColor(status: string): string {
  switch (status) {
    case "worker_verified":
    case "corrected":
      return "#5a9a6a";
    case "flagged":
      return "#c4953a";
    default:
      return "#8a8a8a";
  }
}

export default function DetectionCanvas({
  imageSrc,
  detections,
  imageWidth,
  imageHeight,
  selectedIndex,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);

  const updateScale = useCallback(() => {
    if (!imgRef.current || !imageWidth || !imageHeight) return;

    const displayWidth = imgRef.current.clientWidth;
    const displayHeight = imgRef.current.clientHeight;

    setScale({
      x: displayWidth / imageWidth,
      y: displayHeight / imageHeight,
    });
  }, [imageWidth, imageHeight]);

  useEffect(() => {
    if (imgLoaded) {
      updateScale();
      const timer = setTimeout(() => setShowBoxes(true), 220);
      return () => clearTimeout(timer);
    }
  }, [imgLoaded, updateScale]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div className="overflow-hidden border border-reloop-border bg-reloop-surface">
      <div className="flex items-center justify-between border-b border-reloop-border px-4 py-3 md:px-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-reloop-green animate-pulse-subtle" />
          <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-reloop-text">Analysis View</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">
          {detections.length} candidate{detections.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div ref={containerRef} className="relative bg-black">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Analyzed e-waste image with detection overlays"
          className="block h-auto w-full"
          onLoad={() => setImgLoaded(true)}
          draggable={false}
        />

        {showBoxes &&
          detections.map((det, i) => {
            const left = det.bbox.x1 * scale.x;
            const top = det.bbox.y1 * scale.y;
            const width = (det.bbox.x2 - det.bbox.x1) * scale.x;
            const height = (det.bbox.y2 - det.bbox.y1) * scale.y;
            const color = getVerificationBorderColor(det.verification_status);
            const confColor = getConfidenceColor(det.confidence);
            const displayName = det.corrected_class || det.class_name;
            const isSelected = selectedIndex === i;
            const isDimmed = selectedIndex !== null && !isSelected;

            return (
              <button
                key={`${det.class_id}-${i}`}
                type="button"
                onClick={() => onSelect(i)}
                className="absolute block cursor-pointer rounded-none border-0 bg-transparent p-0 text-left"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? `0 0 0 1px ${color}66` : "none",
                  opacity: isDimmed ? 0.35 : 1,
                  animation: `fadeIn 0.45s ease-out ${i * 0.08}s forwards`,
                }}
                aria-label={`Detected ${displayName} with ${Math.round(det.confidence * 100)}% confidence`}
              >
                <div
                  className="absolute -top-6 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-medium md:text-[11px]"
                  style={{
                    backgroundColor: `${color}dd`,
                    color: "#fff",
                    opacity: isDimmed ? 0.85 : 1,
                  }}
                >
                  <span>{displayName}</span>
                  <span style={{ color: confColor }}>{Math.round(det.confidence * 100)}%</span>
                </div>

                <div className="absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2" style={{ borderColor: color }} />
                <div className="absolute -top-px -right-px h-3 w-3 border-r-2 border-t-2" style={{ borderColor: color }} />
                <div className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2" style={{ borderColor: color }} />
                <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2" style={{ borderColor: color }} />
              </button>
            );
          })}
      </div>
    </div>
  );
}
