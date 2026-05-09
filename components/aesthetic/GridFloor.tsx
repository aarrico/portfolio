type GridFloorProps = {
  className?: string;
  height?: number;
};

/**
 * Refined perspective grid receding to a vanishing point on the horizon.
 * Lines fade with distance via a radial mask. Uses currentColor so the
 * caller controls hue/opacity per theme.
 */
export function GridFloor({ className, height = 220 }: GridFloorProps) {
  const cols = 21; // odd so a line passes through the vanishing point
  const horizonY = 0;
  const bottomY = height;
  const horizonHalf = 0.5; // 50% of width converges
  const bottomHalf = 6; // 600% width at viewer — exaggerated perspective

  const verticals = Array.from({ length: cols }, (_, i) => {
    const t = (i / (cols - 1)) * 2 - 1; // -1 .. 1
    const xTop = 50 + t * horizonHalf * 100;
    const xBot = 50 + t * bottomHalf * 100;
    return { xTop, xBot };
  });

  // Horizontal lines spaced by perspective: y = horizon + h * (n / (n + k))^2
  // 18 receding lines — denser, more defined floor.
  const ROWS = 18;
  const rows = Array.from({ length: ROWS }, (_, i) => {
    const n = i + 1;
    const t = n / ROWS;
    const eased = Math.pow(t, 2.1);
    return horizonY + (bottomY - horizonY) * eased;
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ""}`}
      style={{ height }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`-50 0 200 ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="18%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.95" />
          </linearGradient>
          <mask id="grid-edge-mask">
            <rect x="-50" y="0" width="200" height={height} fill="url(#grid-fade)" />
          </mask>
        </defs>

        <g
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          mask="url(#grid-edge-mask)"
          vectorEffect="non-scaling-stroke"
        >
          {verticals.map((v, i) => (
            <line
              key={`v-${i}`}
              x1={v.xTop}
              y1={horizonY}
              x2={v.xBot}
              y2={bottomY}
            />
          ))}
          <g className="grid-scan">
            {rows.map((y, i) => (
              <line
                key={`h-${i}`}
                x1={-50}
                y1={y}
                x2={150}
                y2={y}
                strokeOpacity={1 + (i / rows.length)}
                strokeWidth={0.6 + (i / rows.length) * 0.7}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
