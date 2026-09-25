"use client";

export default function ProcessingState() {
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-reloop-surface border border-reloop-border rounded-lg p-8 md:p-12 text-center">
        {/* Animated Scanner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-reloop-border rounded-xl animate-spin-slow" />
          {/* Inner scanner */}
          <div className="absolute inset-2 border border-reloop-green/30 rounded-lg">
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-reloop-green-light to-transparent"
                style={{
                  animation: "scanLine 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-reloop-green animate-pulse-subtle" />
          </div>
        </div>

        <p className="text-sm font-medium text-reloop-text mb-1">Analyzing e-waste...</p>
        <p className="text-xs text-reloop-text-muted">
          Running AI detection on your image
        </p>

        {/* Progress shimmer */}
        <div className="mt-6 mx-auto max-w-[200px] h-1 rounded-full overflow-hidden bg-reloop-surface-elevated">
          <div className="h-full animate-shimmer rounded-full" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
      `}</style>
    </div>
  );
}
