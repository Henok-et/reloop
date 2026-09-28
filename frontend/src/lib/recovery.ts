/**
 * Recovery value.
 *
 * The worker enters kilograms and local GHS prices. This module only
 * multiplies those inputs by the verified lot count. Nothing here is a
 * market price or a material composition from the detector.
 */

import { GIZ_CLASSES, classLabel } from "./constants";
import type {
  MaterialRecoveryInput,
  RecoveryDestination,
  ReusableComponentInput,
} from "./types";

export interface CategoryCount {
  category: string;
  label: string;
  /** recorded + pending. What the estimate multiplies by. */
  count: number;
  /** Already written to the lot from earlier photos or manual adds. */
  recorded: number;
  /** Confirmed on the photo under review, not yet written to the lot. */
  pending: number;
}

// ── Hazard flag on typed names ─────────────────────────────────────────────────

export interface HazardFlag {
  label: string;
  care: string;
}

const HAZARD_RULES: { pattern: RegExp; flag: HazardFlag }[] = [
  {
    pattern: /lithium|li[- ]?ion|li[- ]?po|batter|coin cell|power ?cell|\bcells?\b/i,
    flag: {
      label: "Lithium / battery",
      care: "Fire risk if punctured, crushed, or shorted. Remove whole, tape the terminals, keep dry and away from metal scrap. Route to battery collection.",
    },
  },
  {
    pattern: /\boils?\b|lubricant/i,
    flag: {
      label: "Oil",
      care: "May carry refrigerant residue. Drain into a sealed, labelled container. Never onto soil or into a drain.",
    },
  },
  {
    pattern: /refrigerant|freon|\bgas\b|r-?\d{2,4}[a-z]?\b|coolant/i,
    flag: {
      label: "Refrigerant",
      care: "Gas under pressure. Do not cut pipes. Trained staff recover it with equipment.",
    },
  },
  {
    pattern: /capacitor/i,
    flag: {
      label: "Capacitor",
      care: "Can hold a charge after unplugging. A trained person discharges it first.",
    },
  },
  {
    pattern: /mercury|backlight|ccfl|fluorescent|\blamp/i,
    flag: {
      label: "Mercury",
      care: "Do not break. Bag whole and route to controlled disposal.",
    },
  },
  {
    pattern: /\bcrt\b|picture tube|lead glass|tube glass/i,
    flag: {
      label: "Lead glass",
      care: "Do not break the tube. Carry upright and route to specialist recycling.",
    },
  },
  {
    pattern: /magnetron/i,
    flag: {
      label: "Magnetron",
      care: "Insulators may contain beryllium oxide. Do not break or grind. Hand over whole.",
    },
  },
  {
    pattern: /\bfoam\b|insulation/i,
    flag: {
      label: "Insulation foam",
      care: "May hold blowing agents. Leave intact for the recovery site.",
    },
  },
  {
    pattern: /\blead\b|solder/i,
    flag: {
      label: "Lead",
      care: "Do not burn or grind. Keep out of mixed scrap and route to specialist recycling.",
    },
  },
];

/** A caution for a name the worker typed. Null when nothing in the name suggests a hazard. */
export function hazardFor(name: string): HazardFlag | null {
  const text = (name ?? "").trim();
  if (!text) return null;
  return HAZARD_RULES.find((rule) => rule.pattern.test(text))?.flag ?? null;
}

/** Derived material line. Not persisted. */
export interface MaterialRecoveryEstimate {
  id: string;
  category: string;
  materialName: string;
  kgPerItem: number;
  pricePerKg: number;
  itemQuantity: number;
  totalKg: number;
  estimatedValue: number;
  destination: RecoveryDestination | "";
}

/** Derived reusable-component line. Not persisted. */
export interface ReusableComponentEstimate {
  id: string;
  category: string;
  componentName: string;
  quantity: number;
  valuePerUnit: number;
  estimatedValue: number;
  destination: RecoveryDestination | "";
}

export interface RecoveryComputation {
  verifiedItems: number;
  totalKg: number;
  componentUnits: number;
  materialValue: number;
  componentValue: number;
  totalValue: number;
  materials: MaterialRecoveryEstimate[];
  components: ReusableComponentEstimate[];
}

export const RECOVERY_DESTINATIONS: { value: RecoveryDestination; label: string }[] = [
  { value: "repair", label: "Repair" },
  { value: "reuse", label: "Reuse" },
  { value: "recycler", label: "Recycler" },
  { value: "controlled_disposal", label: "Controlled disposal" },
];

const DESTINATION_VALUES = new Set<string>(RECOVERY_DESTINATIONS.map((d) => d.value));

const INPUT_MAX = 1_000_000;

export function sanitizeNonNegative(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, INPUT_MAX);
}

function wholeCount(value: unknown): number {
  return Math.round(sanitizeNonNegative(value));
}

function quantity(value: number): number {
  return Math.round(sanitizeNonNegative(value) * 1000) / 1000;
}

function money(value: number): number {
  const n = sanitizeNonNegative(value);
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function finiteProduct(a: number, b: number): number {
  const product = a * b;
  return Number.isFinite(product) ? product : 0;
}

export function destinationLabel(value: RecoveryDestination | ""): string {
  return RECOVERY_DESTINATIONS.find((d) => d.value === value)?.label ?? "";
}

export function asDestination(value: unknown): RecoveryDestination | "" {
  return typeof value === "string" && DESTINATION_VALUES.has(value) ? (value as RecoveryDestination) : "";
}

export function newEstimateId(prefix: "MAT" | "CMP"): string {
  const time = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${time}${rand}`;
}

export function pluralClassLabel(label: string, count: number): string {
  if (count === 1) return label;
  if (label === "TV") return "TVs";
  if (label.endsWith("s")) return label;
  return `${label}s`;
}

/**
 * Verified counts per class. `recorded` are already in the lot; `pending` are
 * confirmed on the current photo and will be written when the worker moves on.
 */
export function countsFromNames(recorded: string[], pending: string[] = []): CategoryCount[] {
  const recordedMap = new Map<string, number>();
  const pendingMap = new Map<string, number>();
  for (const name of recorded) {
    if (!name) continue;
    recordedMap.set(name, (recordedMap.get(name) ?? 0) + 1);
  }
  for (const name of pending) {
    if (!name) continue;
    pendingMap.set(name, (pendingMap.get(name) ?? 0) + 1);
  }

  const build = (name: string): CategoryCount => {
    const rec = recordedMap.get(name) ?? 0;
    const pen = pendingMap.get(name) ?? 0;
    return { category: name, label: classLabel(name), count: rec + pen, recorded: rec, pending: pen };
  };

  const seen = new Set([...recordedMap.keys(), ...pendingMap.keys()]);
  const known = GIZ_CLASSES.filter((cls) => seen.has(cls)).map(build);
  const extra = [...seen]
    .filter((name) => !(GIZ_CLASSES as readonly string[]).includes(name))
    .sort((a, b) => classLabel(a).localeCompare(classLabel(b)))
    .map(build);

  return [...known, ...extra].filter((row) => row.count > 0);
}

export function materialEstimate(
  input: MaterialRecoveryInput,
  itemQuantity: number
): MaterialRecoveryEstimate {
  const kgPerItem = quantity(input.kgPerItem);
  const pricePerKg = sanitizeNonNegative(input.pricePerKg);
  const verified = wholeCount(itemQuantity);
  const totalKg = quantity(finiteProduct(verified, kgPerItem));
  return {
    id: input.id,
    category: input.category,
    materialName: input.materialName,
    kgPerItem,
    pricePerKg,
    itemQuantity: verified,
    totalKg,
    estimatedValue: money(finiteProduct(totalKg, pricePerKg)),
    destination: asDestination(input.destination),
  };
}

export function componentEstimate(input: ReusableComponentInput): ReusableComponentEstimate {
  const units = quantity(input.quantity);
  const valuePerUnit = sanitizeNonNegative(input.valuePerUnit);
  return {
    id: input.id,
    category: input.category,
    componentName: input.componentName,
    quantity: units,
    valuePerUnit,
    estimatedValue: money(finiteProduct(units, valuePerUnit)),
    destination: asDestination(input.destination),
  };
}

function normalizeMaterial(raw: MaterialRecoveryInput): MaterialRecoveryInput | null {
  if (!raw || typeof raw !== "object" || !raw.id || !raw.category) return null;
  return {
    id: String(raw.id),
    category: String(raw.category),
    materialName: typeof raw.materialName === "string" ? raw.materialName : "",
    kgPerItem: sanitizeNonNegative(raw.kgPerItem),
    pricePerKg: sanitizeNonNegative(raw.pricePerKg),
    destination: asDestination(raw.destination),
  };
}

function normalizeComponent(raw: ReusableComponentInput): ReusableComponentInput | null {
  if (!raw || typeof raw !== "object" || !raw.id || !raw.category) return null;
  return {
    id: String(raw.id),
    category: String(raw.category),
    componentName: typeof raw.componentName === "string" ? raw.componentName : "",
    quantity: sanitizeNonNegative(raw.quantity),
    valuePerUnit: sanitizeNonNegative(raw.valuePerUnit),
    destination: asDestination(raw.destination),
  };
}

export function computeRecovery(
  counts: CategoryCount[],
  materials: MaterialRecoveryInput[],
  components: ReusableComponentInput[]
): RecoveryComputation {
  const active = new Map<string, number>();
  for (const row of counts) {
    const count = wholeCount(row.count);
    if (count > 0) active.set(row.category, count);
  }

  const materialLines = (Array.isArray(materials) ? materials : [])
    .map(normalizeMaterial)
    .filter((row): row is MaterialRecoveryInput => row !== null && active.has(row.category))
    .map((row) => materialEstimate(row, active.get(row.category) ?? 0));

  const componentLines = (Array.isArray(components) ? components : [])
    .map(normalizeComponent)
    .filter((row): row is ReusableComponentInput => row !== null && active.has(row.category))
    .map(componentEstimate);

  const totalKg = quantity(materialLines.reduce((sum, line) => sum + line.totalKg, 0));
  const materialValue = money(materialLines.reduce((sum, line) => sum + line.estimatedValue, 0));
  const componentUnits = quantity(componentLines.reduce((sum, line) => sum + line.quantity, 0));
  const componentValue = money(componentLines.reduce((sum, line) => sum + line.estimatedValue, 0));
  const verifiedItems = wholeCount([...active.values()].reduce((sum, count) => sum + count, 0));

  return {
    verifiedItems,
    totalKg,
    componentUnits,
    materialValue,
    componentValue,
    totalValue: money(materialValue + componentValue),
    materials: materialLines,
    components: componentLines,
  };
}

export function formatPlainQuantity(value: number): string {
  return String(quantity(value));
}

export function formatQuantity(value: number): string {
  return quantity(value).toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/** Always `GHS 1,250.00`. Never another currency. */
export function formatGhs(value: number): string {
  const n = money(value);
  const [whole, frac] = n.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `GHS ${grouped}.${frac}`;
}
