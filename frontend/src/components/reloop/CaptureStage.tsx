"use client";

import type { CaptureMode } from "@/lib/types";
import { GIZ_CLASSES, CLASS_LABELS, CLASS_HANDLING_GROUP } from "@/lib/constants";
import CameraCapture from "./CameraCapture";
import ImageUploader from "./ImageUploader";

interface Props {
  mode: CaptureMode;
  onModeChange: (mode: CaptureMode) => void;
  onImage: (file: File) => void;
  onAddManually: () => void;
}

/**
 * First screen of the station. The camera (or picker) is the page; the
 * framing rule and the seven classes the model knows sit under it.
 */
export default function CaptureStage({ mode, onModeChange, onImage, onAddManually }: Props) {
  return (
    <div className="animate-fade-in space-y-4">
      {mode === "camera" ? (
        <CameraCapture onCapture={onImage} onFallbackToUpload={() => onModeChange("upload")} />
      ) : (
        <ImageUploader onImageSelected={onImage} />
      )}

      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-reloop-text-secondary">
            One appliance, filling most of the frame, in daylight.
          </p>
          <button
            type="button"
            onClick={() => onModeChange(mode === "camera" ? "upload" : "camera")}
            className="text-reloop-text-muted underline-offset-2 transition-colors hover:text-reloop-text hover:underline"
          >
            {mode === "camera" ? "Upload a photo instead" : "Use the camera instead"}
          </button>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Recognises</p>
          <div className="flex flex-wrap gap-1.5">
            {GIZ_CLASSES.map((cls) => {
              const cool = CLASS_HANDLING_GROUP[cls] === "refrigerant";
              return (
                <span
                  key={cls}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                    cool
                      ? "border-reloop-cool/25 text-reloop-cool-light"
                      : "border-reloop-green/25 text-reloop-green-light"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cool ? "bg-reloop-cool-light" : "bg-reloop-green-light"}`} />
                  {CLASS_LABELS[cls]}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-reloop-text-muted">
            <span className="text-reloop-cool-light">Blue</span> items go to refrigerant recovery,{" "}
            <span className="text-reloop-green-light">green</span> to electronics processing.{" "}
            <button
              type="button"
              onClick={onAddManually}
              className="text-reloop-text-secondary underline-offset-2 hover:text-reloop-text hover:underline"
            >
              Add an item without a photo
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
