import type { GIZClass } from "@/lib/constants";

interface Props {
  name: GIZClass;
  className?: string;
}

/** Inline line icons for the seven classes. No external assets. */
export default function ApplianceIcon({ name, className = "h-5 w-5" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<GIZClass, React.ReactNode> = {
  Fridges: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="1.5" />
      <line x1="6" y1="9.5" x2="18" y2="9.5" />
      <line x1="9" y1="5.5" x2="9" y2="7.5" />
      <line x1="9" y1="12" x2="9" y2="15" />
    </>
  ),
  ACs: (
    <>
      <rect x="2.5" y="6" width="19" height="9" rx="1.5" />
      <line x1="5.5" y1="12" x2="18.5" y2="12" />
      <path d="M7 18.5c1 1 2 1 3 0M11 18.5c1 1 2 1 3 0M15 18.5c1 1 2 1 3 0" />
    </>
  ),
  Compressors: (
    <>
      <ellipse cx="12" cy="12.5" rx="7.5" ry="6.5" />
      <path d="M12 6v-2.5M15.5 6.8l1.5-2M8.5 6.8l-1.5-2" />
      <path d="M8 19l-1 2M16 19l1 2" />
      <circle cx="12" cy="12.5" r="2" />
    </>
  ),
  Computers: (
    <>
      <rect x="3" y="4" width="13" height="10" rx="1.2" />
      <line x1="7" y1="18" x2="12" y2="18" />
      <line x1="9.5" y1="14" x2="9.5" y2="18" />
      <rect x="18" y="6" width="3.5" height="12" rx="0.8" />
    </>
  ),
  Laptops: (
    <>
      <rect x="4.5" y="5" width="15" height="10" rx="1.2" />
      <path d="M2.5 18.5h19" />
      <path d="M4.5 15l-1.5 3.5M19.5 15l1.5 3.5" />
    </>
  ),
  Microwave: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="1.5" />
      <rect x="5" y="8" width="10" height="8" rx="0.8" />
      <line x1="18" y1="8.5" x2="18" y2="8.6" />
      <line x1="18" y1="11.5" x2="18" y2="11.6" />
      <line x1="18" y1="14.5" x2="18" y2="14.6" />
    </>
  ),
  TV: (
    <>
      <rect x="2.5" y="4.5" width="19" height="12" rx="1.5" />
      <path d="M8 20h8" />
      <path d="M12 16.5V20" />
    </>
  ),
};
