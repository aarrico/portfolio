type SunProps = {
  size?: number;
  className?: string;
  withGlow?: boolean;
  withSlices?: boolean;
};

export function Sun({
  size = 320,
  className,
  withGlow = true,
  withSlices = true,
}: SunProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="sun-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--sun-stop-2)" />
          <stop offset="55%" stopColor="var(--sun-stop-1)" />
          <stop offset="100%" stopColor="var(--gradient-stop-2)" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sun-stop-1)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="var(--sun-stop-1)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--sun-stop-1)" stopOpacity="0" />
        </radialGradient>
        <mask id="sun-mask">
          <rect width="200" height="200" fill="white" />
          {withSlices && (
            <g fill="black">
              {/* progressively thicker cuts toward the bottom */}
              <rect x="0" y="118" width="200" height="2" />
              <rect x="0" y="128" width="200" height="3" />
              <rect x="0" y="140" width="200" height="4" />
              <rect x="0" y="153" width="200" height="5" />
              <rect x="0" y="167" width="200" height="6" />
              <rect x="0" y="183" width="200" height="8" />
            </g>
          )}
        </mask>
      </defs>

      {withGlow && (
        <circle cx="100" cy="100" r="96" fill="url(#sun-glow)" className="sun-glow" />
      )}

      <circle
        cx="100"
        cy="100"
        r="68"
        fill="url(#sun-fill)"
        mask="url(#sun-mask)"
      />

      {/* refined inner ring — barely visible, adds depth */}
      <circle
        cx="100"
        cy="100"
        r="68"
        fill="none"
        stroke="var(--sun-stop-2)"
        strokeOpacity="0.25"
        strokeWidth="0.75"
      />

      <style>{`
        @keyframes sun-breathe {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.95; transform: scale(1.025); }
        }
        .sun-glow {
          animation: sun-breathe 9s ease-in-out infinite;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .sun-glow { animation: none; opacity: 0.75; }
        }
      `}</style>
    </svg>
  );
}
