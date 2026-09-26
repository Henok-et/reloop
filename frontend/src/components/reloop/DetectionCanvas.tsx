"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { ReviewItem } from "@/lib/types";
import { classLabel, handlingGroupFor, needsReview } from "@/lib/constants";

interface Props {
  imageSrc: string;
  items: ReviewItem[];
  imageWidth: number;
  imageHeight: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

const COOL = "#6a9fc0";
const GREEN = "#5a9a6a";
const AMBER = "#c4953a";
const GREY = "#5a5a5a";

/** Box colour follows the decision: open = amber if low score else grey, decided = group colour. */
function boxColor(item: ReviewItem): string {
  if (item.status === "rejected") return GREY;
  if (item.status === "open") return needsReview(item.confidence) ? AMBER : "#bdbdbd";
  const cls = item.final_class || item.class_name;
  return handlingGroupFor(cls) === "refrigerant" ? COOL : GREEN;
}

export default function DetectionCanvas({
  imageSrc,
  items,
  imageWidth,
  imageHeight,
  selectedIndex,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const updateScale = useCallback(() => {
    if (!imgRef.current || !imageWidth || !imageHeight) return;
    setScale({
      x: imgRef.current.clientWidth / imageWidth,
      y: imgRef.current.clientHeight / imageHeight,
    });
  }, [imageWidth, imageHeight]);

  useEffect(() => {
    if (imgLoaded) updateScale();
  }, [imgLoaded, updateScale]);

  useEffect(() => {
    const observer = new ResizeObserver(() => updateScale());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-lg border border-reloop-border bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL, boxes are scaled to its rendered size */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Analyzed photo with detected items outlined"
        className="block h-auto w-full"
        onLoad={() => setImgLoaded(true)}
        draggable={false}
        onClick={() => onSelect(null)}
      />

      {imgLoaded &&
        items.map((item, i) => {
          const left = item.bbox.x1 * scale.x;
          const top = item.bbox.y1 * scale.y;
          const width = (item.bbox.x2 - item.bbox.x1) * scale.x;
          const height = (item.bbox.y2 - item.bbox.y1) * scale.y;
          const color = boxColor(item);
          const isSelected = selectedIndex === i;
          const isDimmed = selectedIndex !== null && !isSelected;
          const rejected = item.status === "rejected";
          const name = classLabel(item.final_class || item.class_name);

          return (
            <button
              key={`${item.class_id}-${i}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(i);
              }}
              aria-label={`${name}, ${Math.round(item.confidence * 100)} percent`}
              className="absolute block cursor-pointer rounded-none bg-transparent p-0 text-left transition-opacity"
              style={{
                left,
                top,
                width,
                height,
                border: `${isSelected ? 3 : 2}px ${rejected ? "dashed" : "solid"} ${color}`,
                boxShadow: isSelected ? `0 0 0 2px rgba(0,0,0,0.6), 0 0 0 4px ${color}55` : undefined,
                opacity: isDimmed ? 0.35 : 1,
              }}
            >
              <span
                className="absolute left-0 top-0 -translate-y-full whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium leading-tight text-black"
                style={{ backgroundColor: color, maxWidth: "100%" }}
              >
                {i + 1} · {name} {Math.round(item.confidence * 100)}%
              </span>
            </button>
          );
        })}
    </div>
  );
}
