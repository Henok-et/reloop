/**
 * ReLoop Constants
 */

import type { HandlingGroup } from "./types";

// ── GIZ Official Classes ───────────────────────────────────────────────────────

export const GIZ_CLASSES = [
  "ACs",
  "Compressors",
  "Computers",
  "Fridges",
  "Laptops",
  "Microwave",
  "TV",
] as const;

export type GIZClass = (typeof GIZ_CLASSES)[number];

/** Human-readable names for the model classes. */
export const CLASS_LABELS: Record<GIZClass, string> = {
  ACs: "Air conditioner",
  Compressors: "Compressor",
  Computers: "Computer",
  Fridges: "Fridge",
  Laptops: "Laptop",
  Microwave: "Microwave",
  TV: "TV",
};

export function classLabel(className: string): string {
  return (CLASS_LABELS as Record<string, string>)[className] ?? className;
}

// ── Handling Groups (the sorting decision) ─────────────────────────────────────

export const CLASS_HANDLING_GROUP: Record<GIZClass, HandlingGroup> = {
  ACs: "refrigerant",
  Compressors: "refrigerant",
  Fridges: "refrigerant",
  Computers: "electronics",
  Laptops: "electronics",
  Microwave: "electronics",
  TV: "electronics",
};

export function handlingGroupFor(className: string): HandlingGroup {
  return (CLASS_HANDLING_GROUP as Record<string, HandlingGroup>)[className] ?? "electronics";
}

export const HANDLING_GROUPS: Record<
  HandlingGroup,
  { label: string; short: string; sortInstruction: string }
> = {
  refrigerant: {
    label: "Refrigerant equipment",
    short: "Refrigerant",
    sortInstruction: "Keep upright. Do not puncture. Route to controlled refrigerant recovery.",
  },
  electronics: {
    label: "Electronics",
    short: "Electronics",
    sortInstruction: "Keep out of mixed scrap. Remove batteries where present. Route to electronics processing.",
  },
};

// ── Workflow Steps ─────────────────────────────────────────────────────────────

export const WORKFLOW_STEPS = [
  { key: "capture", label: "Capture" },
  { key: "identify", label: "Identify" },
  { key: "verify", label: "Verify" },
  { key: "guide", label: "Guide" },
  { key: "lot", label: "Lot" },
] as const;

// ── Handling Guidance ──────────────────────────────────────────────────────────

export const HANDLING_GUIDANCE: Record<string, { title: string; guidance: string; precautions: string[] }> = {
  ACs: {
    title: "Air Conditioning Units",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    precautions: [
      "May contain refrigerant gases requiring controlled recovery",
      "Electrical components should be handled by trained personnel",
      "Separate from mixed scrap for specialist processing",
    ],
  },
  Compressors: {
    title: "Compressors",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    precautions: [
      "May contain oils and refrigerant gases",
      "Requires specialist handling for safe de-commissioning",
      "Do not puncture or expose to heat sources",
    ],
  },
  Computers: {
    title: "Computers",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Where applicable, batteries and other components should be handled according to appropriate local procedures.",
    precautions: [
      "May contain batteries requiring separate handling",
      "Circuit boards may contain valuable recoverable materials",
      "Data storage devices should be processed securely",
    ],
  },
  Fridges: {
    title: "Refrigerators",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    precautions: [
      "Contains refrigerant gases requiring controlled recovery",
      "Insulation may contain substances requiring specialist handling",
      "Must remain upright during transport where possible",
    ],
  },
  Laptops: {
    title: "Laptops",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Where applicable, batteries and other components should be handled according to appropriate local procedures.",
    precautions: [
      "Contains lithium batteries — handle with care, avoid puncturing",
      "Screens may contain materials requiring specialist recycling",
      "Data storage devices should be processed securely",
    ],
  },
  Microwave: {
    title: "Microwave Ovens",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Internal components may require specialist handling.",
    precautions: [
      "Contains high-voltage components — do not dismantle without training",
      "Magnetron and capacitor require specialist handling",
      "Separate metal casing from electronic components",
    ],
  },
  TV: {
    title: "Televisions",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Screens and internal components may require specialist handling.",
    precautions: [
      "Older CRT models may contain lead and other substances",
      "LCD/LED screens require specialist recycling",
      "Circuit boards may contain valuable recoverable materials",
    ],
  },
};

export const AI_LIMITATIONS_NOTE =
  "AI image detection cannot determine hazardous substances, refrigerant presence, battery condition, electrical safety, or recyclability certification. Follow local regulations and safety procedures.";

// ── File Upload Config ─────────────────────────────────────────────────────────

export const ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.webp";
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Confidence ─────────────────────────────────────────────────────────────────

/**
 * The backend only returns boxes at or above 0.50, so anything shown is at
 * least that. Scores below REVIEW deserve a closer look before confirming.
 */
export const CONFIDENCE_REVIEW = 0.7;

export function needsReview(confidence: number): boolean {
  return confidence < CONFIDENCE_REVIEW;
}

// ── Timing ─────────────────────────────────────────────────────────────────────

/** Shown to the worker while inference runs. Free-tier hosting is slow. */
export const EXPECTED_ANALYSIS_SECONDS = 60;
