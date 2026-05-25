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
  const clipId = `grid-trap-clip-${reactId}`;
  const cols = 21;
  const horizonY = 0;
  const bottomY = height;
  const horizonHalf = 0.5;
  const bottomHalf = 6;

  const xLeftBot = 50 - bottomHalf * 100;
  const xRightBot = 50 + bottomHalf * 100;
  // Vanishing point where the trapezoid's slanted edges converge above the horizon.
  const yVanish = -(height * horizonHalf) / (bottomHalf - horizonHalf);

  const verticals = Array.from({ length: cols }, (_, i) => {
    const t = (i / (cols - 1)) * 2 - 1;
    const xTop = 50 + t * horizonHalf * 100;
    const xBot = 50 + t * bottomHalf * 100;
    return { xTop, xBot };
  });

  const ROWS = 22;
  const TOP_EXTRA = 6;
  const extras = Array.from({ length: TOP_EXTRA }, (_, i) => {
    const n = i - TOP_EXTRA;
    const t = -n / ROWS;
    const eased = Math.pow(t, 1.9);
    return -(bottomY - horizonY) * eased;
  });
  const visible = Array.from({ length: ROWS }, (_, i) => {
    const n = i + 1;
    const t = n / ROWS;
    const eased = Math.pow(t, 1.9);
    return horizonY + (bottomY - horizonY) * eased;
  });
  const rows = [...extras, ...visible];

  const maskY = yVanish;
  const maskHeight = bottomY - yVanish;
  const horizonStop = ((horizonY - yVanish) / maskHeight) * 100;

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
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop
              offset={`${horizonStop}%`}
              stopColor="currentColor"
              stopOpacity="0.35"
            />
            <stop offset="35%" stopColor="currentColor" stopOpacity="0.65" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <mask id={maskId}>
            <rect
              x={xLeftBot}
              y={maskY}
              width={xRightBot - xLeftBot}
              height={maskHeight}
              fill={`url(#${gradientId})`}
            />
          </mask>
          <clipPath id={clipId}>
            <polygon
              points={`50,${yVanish} ${xRightBot},${bottomY} ${xLeftBot},${bottomY}`}
            />
          </clipPath>
        </defs>

        <g
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          mask={`url(#${maskId})`}
          clipPath={`url(#${clipId})`}
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
            {rows.map((y, i) => {
              const closeness = Math.max(y, 0) / bottomY;
              return (
                <line
                  key={`h-${i}`}
                  x1={xLeftBot}
                  y1={y}
                  x2={xRightBot}
                  y2={y}
                  strokeOpacity={0.55 + closeness * 0.4}
                  strokeWidth={0.8 + closeness * 0.9}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
