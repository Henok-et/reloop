"use client";

import { useState, type ReactNode } from "react";
import type { MaterialRecoveryInput, RecoveryDestination, ReusableComponentInput } from "@/lib/types";
import { HAZARDOUS_PARTS } from "@/lib/constants";
import {
  RECOVERY_DESTINATIONS,
  type CategoryCount,
  type MaterialRecoveryEstimate,
  type ReusableComponentEstimate,
  computeRecovery,
  destinationLabel,
  formatGhs,
  formatQuantity,
  hazardFor,
  newEstimateId,
  pluralClassLabel,
} from "@/lib/recovery";

interface Props {
  counts: CategoryCount[];
  materials: MaterialRecoveryInput[];
  components: ReusableComponentInput[];
  readOnly?: boolean;
  onChange?: (materials: MaterialRecoveryInput[], components: ReusableComponentInput[]) => void;
}

const fieldClass =
  "h-11 w-full border border-reloop-border bg-reloop-surface-elevated px-2.5 text-sm text-reloop-text outline-none focus:border-reloop-green";

function materialTemplate(showDestination: boolean, readOnly: boolean): string {
  const columns = ["minmax(0,1.4fr)", "7rem", "6rem", "8rem", "9.5rem"];
  if (showDestination) columns.push("10rem");
  if (!readOnly) columns.push("auto");
  return columns.join(" ");
}

function componentTemplate(showDestination: boolean, readOnly: boolean): string {
  const columns = ["minmax(0,1.4fr)", "7rem", "8rem", "9.5rem"];
  if (showDestination) columns.push("10rem");
  if (!readOnly) columns.push("auto");
  return columns.join(" ");
}

function acceptDecimal(raw: string): boolean {
  return raw.length <= 12 && (raw === "" || /^\d*\.?\d*$/.test(raw));
}

function NumberField({
  id,
  label,
  value,
  readOnly,
  currency = false,
  onValue,
}: {
  id: string;
  label: string;
  value: number;
  readOnly?: boolean;
  currency?: boolean;
  onValue: (next: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  if (readOnly) {
    return (
      <span className="font-mono text-sm tabular-nums text-reloop-text">
        {currency ? formatGhs(value) : formatQuantity(value)}
      </span>
    );
  }
  const shown = draft !== null ? draft : value === 0 ? "" : String(value);
  return (
    <input
      id={id}
      aria-label={label}
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      value={shown}
      onChange={(event) => {
        const raw = event.target.value;
        if (!acceptDecimal(raw)) return;
        setDraft(raw);
        if (raw.trim() === "" || raw === ".") {
          onValue(0);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 0) onValue(n);
      }}
      onBlur={() => setDraft(null)}
      className={`${fieldClass} font-mono tabular-nums`}
    />
  );
}

function TextField({
  id,
  label,
  value,
  readOnly,
  onValue,
}: {
  id: string;
  label: string;
  value: string;
  readOnly?: boolean;
  onValue: (next: string) => void;
}) {
  if (readOnly) {
    return <span className="text-sm font-medium text-reloop-text">{value || "Untitled"}</span>;
  }
  return (
    <input
      id={id}
      aria-label={label}
      value={value}
      maxLength={80}
      autoComplete="off"
      placeholder={label}
      onChange={(event) => onValue(event.target.value)}
      className={fieldClass}
    />
  );
}

function DestinationField({
  id,
  value,
  readOnly,
  onValue,
}: {
  id: string;
  value: RecoveryDestination | "";
  readOnly?: boolean;
  onValue: (next: RecoveryDestination | "") => void;
}) {
  if (readOnly) {
    return <span className="text-sm text-reloop-text-secondary">{destinationLabel(value) || "—"}</span>;
  }
  return (
    <select
      id={id}
      aria-label="Destination"
      value={value}
      onChange={(event) => onValue(event.target.value as RecoveryDestination | "")}
      className={fieldClass}
    >
      <option value="">Not set</option>
      {RECOVERY_DESTINATIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-reloop-text-muted @lg:sr-only">{label}</span>
      {children}
    </label>
  );
}

function Readout({ label, value, tone = "text" }: { label: string; value: string; tone?: "text" | "green" }) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-reloop-text-muted @lg:sr-only">{label}</p>
      <p className={`font-mono text-sm tabular-nums ${tone === "green" ? "text-reloop-green" : "text-reloop-text"}`}>{value}</p>
    </div>
  );
}

function HazardIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0 text-reloop-warning`}
      aria-hidden="true"
    >
      <path d="M12 3.5 2.5 20h19L12 3.5z" />
      <path d="M12 9.5v5" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}

/** Shown under a typed row whose name suggests a hazardous part. */
function RowHazard({ name }: { name: string }) {
  const flag = hazardFor(name);
  if (!flag) return null;
  return (
    <div className="flex items-start gap-2 border border-reloop-warning/30 bg-reloop-warning-muted px-2.5 py-2 @lg:col-span-full @lg:mb-2">
      <HazardIcon className="mt-0.5 h-3.5 w-3.5" />
      <p className="text-[11px] leading-relaxed text-reloop-text-secondary">
        <span className="font-medium text-reloop-warning">Hazardous: {flag.label}. </span>
        {flag.care}
      </p>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-11 text-left text-xs font-medium text-reloop-error">
      {label}
    </button>
  );
}

function ColumnHead({ template, columns }: { template: string; columns: string[] }) {
  return (
    <div
      className="mt-2 hidden border-b border-reloop-border pb-2 text-[10px] uppercase tracking-[0.14em] text-reloop-text-muted @lg:grid @lg:items-center @lg:gap-x-3"
      style={{ gridTemplateColumns: template }}
    >
      {columns.map((column) => (
        <span key={column || "remove"}>{column}</span>
      ))}
    </div>
  );
}

function SummaryLine({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${prominent ? "pt-3" : "py-2"}`}>
      <p
        className={
          prominent
            ? "text-[11px] font-medium uppercase tracking-[0.16em] text-reloop-text"
            : "text-sm text-reloop-text-secondary"
        }
      >
        {label}
      </p>
      <p
        className={
          prominent
            ? "font-mono text-2xl font-medium tabular-nums text-reloop-green sm:text-3xl"
            : "font-mono text-sm tabular-nums text-reloop-text"
        }
      >
        {value}
      </p>
    </div>
  );
}

function MaterialRow({
  line,
  readOnly,
  showDestination,
  onPatch,
  onRemove,
}: {
  line: MaterialRecoveryEstimate;
  readOnly: boolean;
  showDestination: boolean;
  onPatch: (patch: Partial<MaterialRecoveryInput>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="space-y-3 border border-reloop-border bg-reloop-surface-elevated p-3 @lg:grid @lg:items-center @lg:gap-x-3 @lg:border-0 @lg:bg-transparent @lg:p-0 @lg:py-2"
      style={{ gridTemplateColumns: materialTemplate(showDestination, readOnly) }}
    >
      <FieldLabel label="Material">
        <TextField
          id={`mat-name-${line.id}`}
          label="Material name"
          value={line.materialName}
          readOnly={readOnly}
          onValue={(materialName) => onPatch({ materialName })}
        />
      </FieldLabel>
      <FieldLabel label="kg/item">
        <NumberField
          id={`mat-kg-${line.id}`}
          label={`${line.materialName || "Material"} kilograms per item`}
          value={line.kgPerItem}
          readOnly={readOnly}
          onValue={(kgPerItem) => onPatch({ kgPerItem })}
        />
      </FieldLabel>
      <Readout label="Total kg" value={formatQuantity(line.totalKg)} />
      <FieldLabel label="GHS/kg">
        <NumberField
          id={`mat-price-${line.id}`}
          label={`${line.materialName || "Material"} price per kilogram in GHS`}
          value={line.pricePerKg}
          readOnly={readOnly}
          currency={readOnly}
          onValue={(pricePerKg) => onPatch({ pricePerKg })}
        />
      </FieldLabel>
      <Readout label="Value" value={formatGhs(line.estimatedValue)} tone="green" />
      {showDestination && (
        <FieldLabel label="Destination">
          <DestinationField
            id={`mat-dest-${line.id}`}
            value={line.destination}
            readOnly={readOnly}
            onValue={(destination) => onPatch({ destination })}
          />
        </FieldLabel>
      )}
      {!readOnly && <RemoveButton label="Remove" onClick={onRemove} />}
      <RowHazard name={line.materialName} />
    </div>
  );
}

function ComponentRow({
  line,
  readOnly,
  showDestination,
  onPatch,
  onRemove,
}: {
  line: ReusableComponentEstimate;
  readOnly: boolean;
  showDestination: boolean;
  onPatch: (patch: Partial<ReusableComponentInput>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="space-y-3 border border-reloop-border bg-reloop-surface-elevated p-3 @lg:grid @lg:items-center @lg:gap-x-3 @lg:border-0 @lg:bg-transparent @lg:p-0 @lg:py-2"
      style={{ gridTemplateColumns: componentTemplate(showDestination, readOnly) }}
    >
      <FieldLabel label="Component">
        <TextField
          id={`cmp-name-${line.id}`}
          label="Component name"
          value={line.componentName}
          readOnly={readOnly}
          onValue={(componentName) => onPatch({ componentName })}
        />
      </FieldLabel>
      <FieldLabel label="Quantity">
        <NumberField
          id={`cmp-qty-${line.id}`}
          label={`${line.componentName || "Component"} quantity`}
          value={line.quantity}
          readOnly={readOnly}
          onValue={(quantity) => onPatch({ quantity })}
        />
      </FieldLabel>
      <FieldLabel label="GHS/unit">
        <NumberField
          id={`cmp-value-${line.id}`}
          label={`${line.componentName || "Component"} value per unit in GHS`}
          value={line.valuePerUnit}
          readOnly={readOnly}
          currency={readOnly}
          onValue={(valuePerUnit) => onPatch({ valuePerUnit })}
        />
      </FieldLabel>
      <Readout label="Total" value={formatGhs(line.estimatedValue)} tone="green" />
      {showDestination && (
        <FieldLabel label="Destination">
          <DestinationField
            id={`cmp-dest-${line.id}`}
            value={line.destination}
            readOnly={readOnly}
            onValue={(destination) => onPatch({ destination })}
          />
        </FieldLabel>
      )}
      {!readOnly && <RemoveButton label="Remove" onClick={onRemove} />}
      <RowHazard name={line.componentName} />
    </div>
  );
}

function countBreakdown(category: CategoryCount, singular: string, plural: string): string | null {
  if (category.pending === 0) return null;
  const pendingLabel = `${formatQuantity(category.pending)} ${category.pending === 1 ? singular : plural} confirmed on this photo`;
  if (category.recorded === 0) return `${pendingLabel}, recorded when you move to the next photo.`;
  return `${formatQuantity(category.recorded)} recorded earlier in this lot, ${pendingLabel}.`;
}

/** Parts to expect in this class that need separate care. One tap lists them as a component. */
function HazardousParts({
  category,
  readOnly,
  existingNames,
  onAdd,
}: {
  category: CategoryCount;
  readOnly: boolean;
  existingNames: string[];
  onAdd: (name: string) => void;
}) {
  const parts = HAZARDOUS_PARTS[category.category];
  if (!parts || parts.length === 0) return null;
  const listed = new Set(existingNames.map((name) => name.trim().toLowerCase()));

  return (
    <div className="mt-4 border border-reloop-warning/30 bg-reloop-warning-muted px-3 py-3">
      <div className="flex items-center gap-2">
        <HazardIcon className="h-4 w-4" />
        <p className="text-xs font-medium text-reloop-warning">Hazardous parts to expect</p>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-reloop-text-secondary">
        Each {category.label === "TV" ? "TV" : category.label.toLowerCase()} may hold these. Take them out first and keep them apart from the scrap.
      </p>
      <ul className="mt-2.5 divide-y divide-reloop-warning/20">
        {parts.map((part) => {
          const already = listed.has(part.name.toLowerCase());
          return (
            <li key={part.name} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-reloop-text">{part.name}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-reloop-text-secondary">{part.hazard}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-reloop-text-secondary">
                  <span className="font-medium text-reloop-text">Care. </span>
                  {part.care}
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  disabled={already}
                  onClick={() => onAdd(part.name)}
                  className="h-11 shrink-0 border border-reloop-border bg-reloop-surface px-3 text-xs font-medium text-reloop-text-secondary disabled:opacity-50 sm:h-9"
                >
                  {already ? "Listed" : "+ List as component"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Worker-entered recovery estimate for the verified lot.
 * Counts come from the lot. The worker supplies kg, price, and component value.
 */
export default function RecoveryValue({ counts, materials, components, readOnly = false, onChange }: Props) {
  const active = counts.filter((row) => row.count > 0);
  const result = computeRecovery(active, materials, components);
  const hasRows = result.materials.length > 0 || result.components.length > 0;

  if (active.length === 0) return null;

  function emit(nextMaterials: MaterialRecoveryInput[], nextComponents: ReusableComponentInput[]) {
    onChange?.(nextMaterials, nextComponents);
  }

  function patchMaterial(id: string, patch: Partial<MaterialRecoveryInput>) {
    emit(
      materials.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      components
    );
  }

  function patchComponent(id: string, patch: Partial<ReusableComponentInput>) {
    emit(
      materials,
      components.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  const showFigures = !(readOnly && !hasRows);

  return (
    <section aria-labelledby="recovery-value-heading" className="@container border border-reloop-border bg-reloop-surface">
      <div className="border-b border-reloop-border px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-reloop-warning">Estimate</p>
        <h2 id="recovery-value-heading" className="mt-1 text-lg font-medium text-reloop-text">
          Recovery value
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-reloop-text-secondary">
          You enter the expected material quantity and the local price. The station multiplies those by the verified count.
        </p>
      </div>

      {showFigures && (
        <div className="grid grid-cols-1 gap-px bg-reloop-border sm:grid-cols-2">
          <div className="bg-reloop-surface px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted">Estimated recoverable material</p>
            <p className="mt-2 font-mono text-3xl font-light tabular-nums text-reloop-text">
              {formatQuantity(result.totalKg)} kg
            </p>
          </div>
          <div className="bg-reloop-surface px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-reloop-warning">Estimated recovery value</p>
            <p className="mt-2 font-mono text-3xl font-medium tabular-nums text-reloop-green">{formatGhs(result.totalValue)}</p>
          </div>
        </div>
      )}

      {readOnly && !hasRows ? (
        <p className="border-t border-reloop-border px-4 py-4 text-sm text-reloop-text-secondary">
          No recovery estimate was entered for this lot.
        </p>
      ) : (
        <div className="divide-y divide-reloop-border border-t border-reloop-border">
          {active.map((category) => {
            const materialLines = result.materials.filter((line) => line.category === category.category);
            const componentLines = result.components.filter((line) => line.category === category.category);
            const showMaterialDestination = !readOnly || materialLines.some((line) => line.destination);
            const showComponentDestination = !readOnly || componentLines.some((line) => line.destination);
            const countLabel = pluralClassLabel(category.label, category.count);
            const materialColumns = ["Material", "kg/item", "Total kg", "GHS/kg", "Value"];
            const componentColumns = ["Component", "Quantity", "GHS/unit", "Total"];
            if (showMaterialDestination) materialColumns.push("Destination");
            if (!readOnly) materialColumns.push("Remove");
            if (showComponentDestination) componentColumns.push("Destination");
            if (!readOnly) componentColumns.push("Remove");

            return (
              <div key={category.category} className="px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Verified lot</p>
                <h3 className="mt-1 text-base font-medium text-reloop-text">
                  {formatQuantity(category.count)} × {countLabel}
                </h3>
                {(() => {
                  const singular = category.label === "TV" ? "TV" : category.label.toLowerCase();
                  const plural = pluralClassLabel(category.label, 2) === "TVs" ? "TVs" : pluralClassLabel(category.label, 2).toLowerCase();
                  const breakdown = countBreakdown(category, singular, plural);
                  return breakdown ? (
                    <p className="mt-1 text-xs text-reloop-warning">{breakdown}</p>
                  ) : null;
                })()}
                {!readOnly && (
                  <p className="mt-1 text-xs text-reloop-text-secondary">
                    Totals use these {formatQuantity(category.count)} verified {countLabel === "TVs" ? "TVs" : countLabel.toLowerCase()}. Enter kg per item and the local GHS price.
                  </p>
                )}

                <HazardousParts
                  category={category}
                  readOnly={readOnly}
                  existingNames={componentLines.map((line) => line.componentName)}
                  onAdd={(name) =>
                    emit(materials, [
                      ...components,
                      {
                        id: newEstimateId("CMP"),
                        category: category.category,
                        componentName: name,
                        quantity: category.count,
                        valuePerUnit: 0,
                        destination: "",
                      },
                    ])
                  }
                />

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted">Material recovery</p>
                  {materialLines.length === 0 && readOnly && (
                    <p className="mt-2 text-xs text-reloop-text-muted">No materials entered.</p>
                  )}
                  {materialLines.length > 0 && (
                    <>
                      <ColumnHead template={materialTemplate(showMaterialDestination, readOnly)} columns={materialColumns} />
                      <div className="mt-2 space-y-3 @lg:mt-0 @lg:space-y-0 @lg:divide-y @lg:divide-reloop-border">
                        {materialLines.map((line) => (
                          <MaterialRow
                            key={line.id}
                            line={line}
                            readOnly={readOnly}
                            showDestination={showMaterialDestination}
                            onPatch={(patch) => patchMaterial(line.id, patch)}
                            onRemove={() => emit(materials.filter((row) => row.id !== line.id), components)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {!readOnly && (
                    <button
                      id={`btn-add-material-${category.category}`}
                      type="button"
                      onClick={() =>
                        emit(
                          [
                            ...materials,
                            {
                              id: newEstimateId("MAT"),
                              category: category.category,
                              materialName: "",
                              kgPerItem: 0,
                              pricePerKg: 0,
                              destination: "",
                            },
                          ],
                          components
                        )
                      }
                      className="mt-3 h-11 border border-dashed border-reloop-border px-3 text-sm text-reloop-text-secondary"
                    >
                      + Add material
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-reloop-text-muted">Reusable components</p>
                  {componentLines.length === 0 && readOnly && (
                    <p className="mt-2 text-xs text-reloop-text-muted">No reusable components entered.</p>
                  )}
                  {componentLines.length > 0 && (
                    <>
                      <ColumnHead template={componentTemplate(showComponentDestination, readOnly)} columns={componentColumns} />
                      <div className="mt-2 space-y-3 @lg:mt-0 @lg:space-y-0 @lg:divide-y @lg:divide-reloop-border">
                        {componentLines.map((line) => (
                          <ComponentRow
                            key={line.id}
                            line={line}
                            readOnly={readOnly}
                            showDestination={showComponentDestination}
                            onPatch={(patch) => patchComponent(line.id, patch)}
                            onRemove={() => emit(materials, components.filter((row) => row.id !== line.id))}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {!readOnly && (
                    <button
                      id={`btn-add-component-${category.category}`}
                      type="button"
                      onClick={() =>
                        emit(materials, [
                          ...components,
                          {
                            id: newEstimateId("CMP"),
                            category: category.category,
                            componentName: "",
                            quantity: category.count,
                            valuePerUnit: 0,
                            destination: "",
                          },
                        ])
                      }
                      className="mt-3 h-11 border border-dashed border-reloop-border px-3 text-sm text-reloop-text-secondary"
                    >
                      + Add component
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-reloop-border px-4 py-4">
        {showFigures && (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-reloop-text-muted">Recovery summary</p>
            <div className="mt-2 divide-y divide-reloop-border">
              <SummaryLine label="Verified items" value={formatQuantity(result.verifiedItems)} />
              <SummaryLine label="Estimated recoverable material" value={`${formatQuantity(result.totalKg)} kg`} />
              <SummaryLine label="Reusable components" value={`${formatQuantity(result.componentUnits)} units`} />
              <SummaryLine label="Estimated material value" value={formatGhs(result.materialValue)} />
              <SummaryLine label="Estimated reusable component value" value={formatGhs(result.componentValue)} />
            </div>
            <div className="mt-3 border-t border-reloop-border">
              <SummaryLine label="Estimated total recovery value" value={formatGhs(result.totalValue)} prominent />
            </div>
          </>
        )}
        <div className={`space-y-2 text-xs leading-relaxed text-reloop-text-secondary ${showFigures ? "mt-4" : ""}`}>
          <p>
            Recovery values are worker-entered estimates based on expected material quantity and local reference prices.
            Actual recovered quantity and value may vary depending on item condition, dismantling results, material purity,
            and buyer/recycler prices.
          </p>
          <p>AI detection does not determine material composition or monetary value.</p>
        </div>
      </div>
    </section>
  );
}
