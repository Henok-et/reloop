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

export const HANDLING_GUIDANCE: Record<
  string,
  { title: string; guidance: string; hazard: string; precautions: string[] }
> = {
  ACs: {
    title: "Air Conditioning Units",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    hazard: "Refrigerant gas and oil sealed in the circuit, plus electrical parts.",
    precautions: [
      "Do not puncture the pipes or the compressor",
      "Keep the unit upright and out of heat",
      "Electrical work and refrigerant recovery are for trained personnel",
    ],
  },
  Compressors: {
    title: "Compressors",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    hazard: "Oil and residual refrigerant, sometimes still under pressure.",
    precautions: [
      "Do not puncture the shell or open it with heat",
      "Specialist decommissioning only",
      "Keep separate from mixed scrap",
    ],
  },
  Computers: {
    title: "Computers",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Where applicable, batteries and other components should be handled according to appropriate local procedures.",
    hazard: "Batteries, and metals on the circuit boards.",
    precautions: [
      "Remove batteries where you can do so without breaking them",
      "Do not crush or burn the unit",
      "Data storage should be wiped or destroyed by the processor",
    ],
  },
  Fridges: {
    title: "Refrigerators",
    guidance:
      "Handle as equipment requiring appropriate recovery and recycling procedures. Avoid unsafe dismantling or uncontrolled release of refrigerants.",
    hazard: "Refrigerant gas, and insulation foam that can hold blowing agents.",
    precautions: [
      "Do not lay it on its side",
      "Do not cut into the back panel or the cooling pipes",
      "Leave the insulation foam for the recovery site",
    ],
  },
  Laptops: {
    title: "Laptops",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Where applicable, batteries and other components should be handled according to appropriate local procedures.",
    hazard: "A lithium battery, and materials in the screen.",
    precautions: [
      "Do not puncture, bend, or crush the battery",
      "If the battery is swollen or leaking, set the laptop aside and do not stack it",
      "Screens and storage devices go to specialist processing",
    ],
  },
  Microwave: {
    title: "Microwave Ovens",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Internal components may require specialist handling.",
    hazard: "A capacitor that can hold a high-voltage charge after the unit is unplugged, and a magnetron.",
    precautions: [
      "Do not open the case without training",
      "Do not strike or dismantle the magnetron",
      "Separate the metal casing from the electronic parts at a specialist site",
    ],
  },
  TV: {
    title: "Televisions",
    guidance:
      "Keep electronic equipment separated from mixed scrap. Screens and internal components may require specialist handling.",
    hazard: "Lead in older picture-tube glass, or mercury in some flat-screen backlights.",
    precautions: [
      "Do not break the screen",
      "Carry it upright and do not stack heavy items on it",
      "Circuit boards and screens go to specialist recycling",
    ],
  },
};

// ── Sample Photos ──────────────────────────────────────────────────────────────

/** Real yard photos served from /public so a judge can try the station without an appliance. */
export const SAMPLE_PHOTOS = [
  {
    src: "/samples/yard-freezer.jpg",
    file: "yard-freezer.jpg",
    label: "Chest freezer in a yard",
    note: "One item, far away, hard ground and vans behind it.",
    width: 768,
    height: 1024,
  },
  {
    src: "/samples/ac-units.jpg",
    file: "ac-units.jpg",
    label: "Stacked AC units at a repair shop",
    note: "Many items in one frame. Expect several boxes to check.",
    width: 1024,
    height: 576,
  },
] as const;

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
