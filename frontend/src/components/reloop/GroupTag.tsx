import type { HandlingGroup } from "@/lib/types";
import { HANDLING_GROUPS } from "@/lib/constants";

interface Props {
  group: HandlingGroup;
  size?: "sm" | "md";
}

/** Colour-coded label for the sorting decision: refrigerant vs electronics. */
export default function GroupTag({ group, size = "sm" }: Props) {
  const isCool = group === "refrigerant";
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-[0.16em] ${pad} ${
        isCool
          ? "border-reloop-cool/30 bg-reloop-cool-muted text-reloop-cool-light"
          : "border-reloop-green/30 bg-reloop-green-muted text-reloop-green-light"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${isCool ? "bg-reloop-cool-light" : "bg-reloop-green-light"}`}
        aria-hidden="true"
      />
      {HANDLING_GROUPS[group].short}
    </span>
  );
}
