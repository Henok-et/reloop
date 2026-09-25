/**
 * ReLoop Constants
 */

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

// ── Workflow Steps ─────────────────────────────────────────────────────────────

export const WORKFLOW_STEPS = [
  { key: "collect", label: "Collect" },
  { key: "identify", label: "Identify" },
  { key: "verify", label: "Verify" },
  { key: "guide", label: "Guide" },
  { key: "sort", label: "Sort" },
  { key: "handover", label: "Handover" },
  { key: "trace", label: "Trace" },
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

// ── File Upload Config ─────────────────────────────────────────────────────────

export const ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.webp";
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Confidence Thresholds ──────────────────────────────────────────────────────

export const CONFIDENCE_LOW = 0.5;
export const CONFIDENCE_MEDIUM = 0.7;
