"use client";

import { useCallback, useRef, useState } from "react";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface Props {
  onImageSelected: (file: File) => void;
}

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-reloop-text mb-1">Upload E-Waste Image</h2>
        <p className="text-sm text-reloop-text-secondary">
          Upload a photo for AI-assisted identification
        </p>
      </div>

      {/* Drop Zone */}
      <div
        id="upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop an image or click to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer border-2 border-dashed rounded-lg p-12 md:p-16 text-center transition-all duration-300 ${
          isDragging
            ? "border-reloop-green bg-reloop-green-muted"
            : "border-reloop-border hover:border-reloop-text-muted bg-reloop-surface"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isDragging
                ? "bg-reloop-green/20 text-reloop-green-light"
                : "bg-reloop-surface-elevated text-reloop-text-secondary"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-reloop-text mb-1">
              {isDragging ? "Drop image here" : "Drag and drop an image"}
            </p>
            <p className="text-xs text-reloop-text-muted">
              or click to browse • JPG, PNG, WebP • Max {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-reloop-error-muted border border-reloop-error/30 animate-fade-in">
          <p className="text-sm text-reloop-error">{error}</p>
        </div>
      )}
    </div>
  );
}
