"use client";

import { useCallback, useRef, useState } from "react";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface Props {
  onImageSelected: (file: File) => void;
}

/** One tap opens the picker. Drag and drop still works on desktop. */
export default function ImageUploader({ onImageSelected }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      const ext = file.name.split(".").pop()?.toLowerCase();
      const validExts = ["jpg", "jpeg", "png", "webp"];
      if (!ext || !validExts.includes(ext)) {
        setError(`Unsupported format ".${ext}". Use JPG, PNG, or WebP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Selected file is not an image.");
        return;
      }

      onImageSelected(file);
    },
    [onImageSelected]
  );

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto max-w-2xl">
      <div
        id="upload-dropzone"
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) validateAndSelect(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        className={`flex aspect-[4/3] flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed p-8 text-center transition-colors sm:aspect-video ${
          isDragging ? "border-reloop-green bg-reloop-green-muted" : "border-reloop-border bg-reloop-surface"
        }`}
      >
        <button
          id="btn-choose-photo"
          type="button"
          onClick={openPicker}
          className="inline-flex items-center gap-2.5 rounded-lg bg-reloop-green px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-reloop-green-light"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Choose a photo
        </button>
        <p className="text-xs text-reloop-text-muted">
          {isDragging ? "Drop it here" : `or drop a file here · JPG, PNG, WebP · up to ${MAX_FILE_SIZE_MB} MB`}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSelect(file);
            e.target.value = "";
          }}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {error && (
        <div className="mt-3 animate-fade-in rounded border border-reloop-error/30 bg-reloop-error-muted p-3">
          <p className="text-sm text-reloop-error">{error}</p>
        </div>
      )}
    </div>
  );
}
