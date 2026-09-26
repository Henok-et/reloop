/**
 * ReLoop Type Definitions
 * AI-Assisted E-Waste Tracking & Circular Guidance
 */

// ── API Response Types ─────────────────────────────────────────────────────────

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BBox;
}

export interface PredictionResponse {
  success: boolean;
  session_id: string;
  detections: Detection[];
  image_width: number;
  image_height: number;
  confidence_threshold?: number;
  iou_threshold?: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_error?: string | null;
  service: string;
  version: string;
}

// ── Handling ───────────────────────────────────────────────────────────────────

/** The sorting decision a worker makes once a class is known. */
export type HandlingGroup = "refrigerant" | "electronics";

// ── Review (one photo) ─────────────────────────────────────────────────────────

/**
 * A model proposal and the worker's decision on it.
 * `open` means no decision yet. Only confirmed/corrected items enter the lot.
 */
export type ReviewStatus = "open" | "confirmed" | "corrected" | "rejected";

export interface ReviewItem extends Detection {
  status: ReviewStatus;
  /** Final class after correction. Equals class_name when confirmed. */
  final_class?: string;
}

// ── Lot (many photos) ──────────────────────────────────────────────────────────

export type LotItemSource = "ai_confirmed" | "ai_corrected" | "manual";

export interface LotItem {
  id: string;
  lot_id: string;
  /** Verified class recorded to the lot. */
  class_name: string;
  handling_group: HandlingGroup;
  source: LotItemSource;
  /** What the model proposed, if the item came from a detection. */
  detected_class: string | null;
  confidence: number | null;
  photo_index: number;
  recorded_at: string;
}

export interface Lot {
  id: string;
  started_at: string;
  closed_at: string | null;
  photo_count: number;
  items: LotItem[];
  worker: string;
  site: string;
}

// ── App State ──────────────────────────────────────────────────────────────────

export type CaptureMode = "camera" | "upload";

export type AppPhase =
  | "capture"
  | "preview"
  | "analyzing"
  | "review"
  | "error"
  | "lot_summary";
