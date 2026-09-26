/**
 * Cheap, on-device checks run on a photo before it is sent for inference.
 *
 * These catch the frames that most often come back empty: blurry, too dark or
 * washed out, or too small. They never block the worker; they only warn.
 */

export type CheckStatus = "pass" | "warn";

export interface FrameCheck {
  key: "sharpness" | "exposure" | "size";
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface FrameAssessment {
  width: number;
  height: number;
  checks: FrameCheck[];
  warnings: number;
}

const SAMPLE_WIDTH = 256;
const MIN_EDGE_PX = 480;
const SHARPNESS_WARN_BELOW = 35;
const DARK_BELOW = 55;
const BRIGHT_ABOVE = 205;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    img.src = url;
  });
}

export async function assessFrame(file: File): Promise<FrameAssessment | null> {
  if (typeof document === "undefined") return null;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return null;
  }

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, SAMPLE_WIDTH / width);
  const w = Math.max(8, Math.round(width * scale));
  const h = Math.max(8, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }

  // Grayscale
  const gray = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = g;
    sum += g;
  }
  const meanLum = sum / (w * h);

  // Variance of Laplacian as a sharpness proxy
  let lapSum = 0;
  let lapSqSum = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      lapSum += lap;
      lapSqSum += lap * lap;
      n++;
    }
  }
  const lapMean = n ? lapSum / n : 0;
  const sharpness = n ? lapSqSum / n - lapMean * lapMean : 0;

  const checks: FrameCheck[] = [
    {
      key: "sharpness",
      label: "Sharp",
      status: sharpness < SHARPNESS_WARN_BELOW ? "warn" : "pass",
      detail:
        sharpness < SHARPNESS_WARN_BELOW
          ? "Looks blurry. Hold still and tap to focus."
          : "In focus.",
    },
    {
      key: "exposure",
      label: "Lit",
      status: meanLum < DARK_BELOW || meanLum > BRIGHT_ABOVE ? "warn" : "pass",
      detail:
        meanLum < DARK_BELOW
          ? "Too dark. Move into daylight or add light."
          : meanLum > BRIGHT_ABOVE
            ? "Washed out. Avoid shooting into the sun."
            : "Lighting is fine.",
    },
    {
      key: "size",
      label: "Large enough",
      status: Math.min(width, height) < MIN_EDGE_PX ? "warn" : "pass",
      detail:
        Math.min(width, height) < MIN_EDGE_PX
          ? `Small image (${width}×${height}). Use the camera at full resolution.`
          : `${width}×${height}`,
    },
  ];

  return {
    width,
    height,
    checks,
    warnings: checks.filter((c) => c.status === "warn").length,
  };
}
