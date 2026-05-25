// components/aesthetic/GridFloor.tsx
import { useId } from "react";

type GridFloorProps = {
  className?: string;
  height?: number;
};

export function GridFloor({ className, height = 220 }: GridFloorProps) {
  const reactId = useId();
  const gradientId = `grid-fade-${reactId}`;
  const maskId = `grid-edge-mask-${reactId}`;
  const cols = 21;
  const horizonY = 0;
  const bottomY = height;
  const horizonHalf = 0.5;
  const bottomHalf = 6;

  const verticals = Array.from({ length: cols }, (_, i) => {
    const t = (i / (cols - 1)) * 2 - 1;
    const xTop = 50 + t * horizonHalf * 100;
    const xBot = 50 + t * bottomHalf * 100;
    return { xTop, xBot };
  });

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
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.30" />
            <stop offset="20%" stopColor="currentColor" stopOpacity="0.60" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <mask id={maskId}>
            <rect
              x="-50"
              y="0"
              width="200"
              height={height}
              fill={`url(#${gradientId})`}
            />
          </mask>
        </defs>

        <g
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          mask={`url(#${maskId})`}
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
                strokeOpacity={0.4 + (i / rows.length) * 0.4}
                strokeWidth={0.5 + (i / rows.length) * 0.5}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
