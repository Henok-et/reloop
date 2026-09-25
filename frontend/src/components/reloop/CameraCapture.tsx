"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface Props {
  onCapture: (file: File) => void;
}

type CameraState = "idle" | "requesting" | "active" | "captured" | "error";

export default function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // rear camera on mobile
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
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found on this device."
            : "Unable to access camera. Please try again.";

      setErrorMessage(errorMsg);
      setCameraState("error");
    }
  }, []);

  const captureImage = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `reloop-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
        setCapturedFile(file);
        setCameraState("captured");

        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      },
      "image/jpeg",
      0.9
    );
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setCapturedFile(null);
    setCameraState("idle");
  }, []);

  const confirmCapture = useCallback(() => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  }, [capturedFile, onCapture]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-reloop-text mb-1">Camera Capture</h2>
        <p className="text-sm text-reloop-text-secondary">
          Point your camera at e-waste for AI-assisted identification
        </p>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Idle: Start Button */}
      {cameraState === "idle" && (
        <div className="bg-reloop-surface border border-reloop-border rounded-lg p-12 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-reloop-surface-elevated flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-reloop-text-secondary" aria-hidden="true">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <button
            id="btn-start-camera"
            onClick={startCamera}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-reloop-green hover:bg-reloop-green-light text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-reloop-green/20"
          >
            Open Camera
          </button>
          <p className="text-xs text-reloop-text-muted mt-3">
            Camera permission will be requested
          </p>
        </div>
      )}

      {/* Requesting permission */}
      {cameraState === "requesting" && (
        <div className="bg-reloop-surface border border-reloop-border rounded-lg p-12 text-center animate-fade-in">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-reloop-border border-t-reloop-green rounded-full animate-spin-slow" />
          <p className="text-sm text-reloop-text-secondary">Requesting camera access...</p>
        </div>
      )}

      {/* Active: Live Feed */}
      {cameraState === "active" && (
        <div className="bg-reloop-surface border border-reloop-border rounded-lg overflow-hidden animate-fade-in-scale">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[60vh] object-contain"
              aria-label="Camera viewfinder"
            />
            {/* Capture overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex justify-center">
                <button
                  id="btn-capture"
                  onClick={captureImage}
                  className="w-16 h-16 rounded-full bg-white/90 hover:bg-white border-4 border-white/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                  aria-label="Capture photo"
                >
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-reloop-text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Captured: Preview */}
      {cameraState === "captured" && capturedImage && (
        <div className="bg-reloop-surface border border-reloop-border rounded-lg overflow-hidden animate-fade-in-scale">
          <div className="relative bg-black flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured e-waste image"
              className="max-h-[60vh] w-auto object-contain rounded"
            />
          </div>
          <div className="p-4 flex items-center justify-between gap-3">
            <button
              id="btn-retake"
              onClick={retake}
              className="px-4 py-2.5 rounded-lg border border-reloop-border text-reloop-text-secondary hover:text-reloop-text text-sm font-medium transition-all duration-200"
            >
              Retake
            </button>
            <button
              id="btn-use-capture"
              onClick={confirmCapture}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-reloop-green hover:bg-reloop-green-light text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-reloop-green/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Use This Image
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {cameraState === "error" && (
        <div className="bg-reloop-surface border border-reloop-error/30 rounded-lg p-8 text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-reloop-error-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-reloop-error" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p className="text-sm text-reloop-text mb-1 font-medium">Camera Unavailable</p>
          <p className="text-sm text-reloop-text-secondary mb-6">{errorMessage}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-lg bg-reloop-green hover:bg-reloop-green-light text-white text-sm font-medium transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setCameraState("idle");
                setErrorMessage(null);
              }}
              className="px-5 py-2.5 rounded-lg border border-reloop-border text-reloop-text-secondary hover:text-reloop-text text-sm font-medium transition-all duration-200"
            >
              Upload an Image Instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
