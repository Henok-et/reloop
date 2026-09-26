"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (file: File) => void;
  onFallbackToUpload: () => void;
}

type CameraState = "requesting" | "active" | "error";

/**
 * Opens the rear camera as soon as it mounts and hands the captured frame
 * straight to the parent. The preview/analyze step lives in the workspace,
 * so there is no separate "use this image" screen here.
 */
export default function CameraCapture({ onCapture, onFallbackToUpload }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  /** Requests the stream and reports the outcome through state. */
  const openStream = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("This browser cannot open the camera.");
      setCameraState("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");
    } catch (err) {
      const errorMsg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in the browser settings, or upload a photo instead."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found on this device."
            : "Could not open the camera.";

      setErrorMessage(errorMsg);
      setCameraState("error");
    }
  }, []);

  /** Manual retry from the error state. */
  const startCamera = useCallback(() => {
    setCameraState("requesting");
    setErrorMessage(null);
    void openStream();
  }, [openStream]);

  useEffect(() => {
    // Open the camera as an async continuation; the outcome arrives via state later.
    void Promise.resolve().then(openStream);
    return stopStream;
  }, [openStream, stopStream]);

  const captureImage = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || isCapturing) return;

    setIsCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (!blob) return;
        const file = new File([blob], `reloop-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopStream();
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }, [isCapturing, onCapture, stopStream]);

  return (
    <div className="mx-auto max-w-2xl">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <div className="overflow-hidden rounded-lg border border-reloop-border bg-reloop-surface">
        <div className="relative aspect-[4/3] bg-black sm:aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover transition-opacity ${cameraState === "active" ? "opacity-100" : "opacity-0"}`}
            aria-label="Camera viewfinder"
          />

          {cameraState === "active" && (
            <>
              {/* Framing guide */}
              <div className="pointer-events-none absolute inset-[8%] rounded border border-white/25" aria-hidden="true">
                <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-white/80" />
                <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-white/80" />
                <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-white/80" />
                <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-white/80" />
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent p-5">
                <button
                  id="btn-capture"
                  type="button"
                  onClick={captureImage}
                  disabled={isCapturing}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white/90 transition-all hover:bg-white active:scale-95 disabled:opacity-60"
                  aria-label="Take photo"
                >
                  <span className="h-12 w-12 rounded-full border-2 border-reloop-text-muted bg-white" />
                </button>
              </div>
            </>
          )}

          {cameraState === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-reloop-border border-t-reloop-green" />
              <p className="text-sm text-reloop-text-secondary">Opening camera…</p>
            </div>
          )}

          {cameraState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="text-sm text-reloop-text">Camera unavailable</p>
              <p className="max-w-sm text-xs text-reloop-text-secondary">{errorMessage}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded border border-reloop-border px-4 py-2 text-xs font-medium text-reloop-text-secondary transition-colors hover:text-reloop-text"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={onFallbackToUpload}
                  className="rounded bg-reloop-green px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-reloop-green-light"
                >
                  Upload a photo instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
