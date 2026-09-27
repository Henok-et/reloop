import { HANDLING_GROUPS, HANDLING_GUIDANCE, handlingGroupFor } from "@/lib/constants";

interface Props {
  className: string;
}

/**
 * Class-based caution shown once a class is known. The photo cannot prove a
 * hazard is present, so the wording stays "may contain".
 */
export default function HazardNote({ className }: Props) {
  const guidance = HANDLING_GUIDANCE[className];
  if (!guidance) return null;
  const group = handlingGroupFor(className);

  return (
    <div className="rounded-lg border border-reloop-warning/30 bg-reloop-warning-muted px-3 py-3">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-reloop-warning"
          aria-hidden="true"
        >
          <path d="M12 3.5 2.5 20h19L12 3.5z" />
          <path d="M12 9.5v5" />
          <path d="M12 17.2h.01" />
        </svg>
        <p className="text-xs font-medium text-reloop-warning">May contain hazardous material</p>
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-reloop-text-secondary">
        <span className="font-medium text-reloop-text">Possible hazard. </span>
        {guidance.hazard}
      </p>

      <p className="mt-2.5 text-[11px] font-medium text-reloop-text">How to handle</p>
      <p className="mt-1 text-[11px] leading-relaxed text-reloop-text-secondary">
        {HANDLING_GROUPS[group].sortInstruction}
      </p>
      <ul className="mt-1.5 space-y-1">
        {guidance.precautions.map((line) => (
          <li key={line} className="flex items-start gap-2 text-[11px] leading-relaxed text-reloop-text-secondary">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-reloop-warning" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
