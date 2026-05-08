type SunProps = {
  size?: number;
  className?: string;
  withGlow?: boolean;
};

export function Sun({ size = 320, className, withGlow = true }: SunProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="sun-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sun-stop-2)" />
          <stop offset="100%" stopColor="var(--sun-stop-1)" />
        </radialGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sun-stop-1)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--sun-stop-1)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {withGlow && (
        <circle cx="50" cy="50" r="48" fill="url(#sun-glow)" className="sun-glow" />
      )}
      <circle cx="50" cy="50" r="30" fill="url(#sun-fill)" />
      <style>{`
        @keyframes sun-breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .sun-glow {
          animation: sun-breathe 7s ease-in-out infinite;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .sun-glow { animation: none; opacity: 0.8; }
        }
      `}</style>
    </svg>
  );
}
