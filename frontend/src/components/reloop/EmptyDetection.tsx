"use client";

interface Props {
  onReset: () => void;
}

export default function EmptyDetection({ onReset }: Props) {
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-reloop-surface border border-reloop-border rounded-lg p-8 md:p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-reloop-surface-elevated flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-reloop-text-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-reloop-text mb-1">No E-Waste Detected</h3>
        <p className="text-sm text-reloop-text-secondary mb-6">
          No target e-waste objects were detected in this image. The model recognizes: ACs,
          Compressors, Computers, Fridges, Laptops, Microwave, and TV.
        </p>
        <button
          id="btn-try-another"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-reloop-green hover:bg-reloop-green-light text-white text-sm font-medium transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Try Another Image
        </button>
      </div>
    </div>
  );
}
