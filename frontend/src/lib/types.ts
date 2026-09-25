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
  service: string;
  version: string;
}

// ── Verification Types ─────────────────────────────────────────────────────────

export type VerificationStatus = "ai_detected" | "worker_verified" | "corrected" | "flagged";

export interface VerifiedDetection extends Detection {
  verification_status: VerificationStatus;
  corrected_class?: string;
}

// ── Session Record Types ───────────────────────────────────────────────────────

export interface SessionRecord {
  id: string;
  session_id: string;
  detected_class: string;
  verified_class: string;
  confidence: number;
  verification_status: VerificationStatus;
  timestamp: string;
  image_reference: string;
}

// ── Workflow ───────────────────────────────────────────────────────────────────

export type WorkflowStep =
  | "collect"
  | "identify"
  | "verify"
  | "guide"
  | "sort"
  | "handover"
  | "trace";

// ── App State ──────────────────────────────────────────────────────────────────

export type AppPhase =
  | "idle"
  | "capturing"
  | "preview"
  | "analyzing"
  | "results"
  | "error";
