type PalmProps = {
  side?: "left" | "right";
  className?: string;
  height?: number;
};

export function Palm({ side = "left", className, height = 320 }: PalmProps) {
  const flip = side === "right" ? "scale-x-[-1]" : "";
  return (
    <svg
      height={height}
      viewBox="0 0 100 200"
      aria-hidden="true"
      className={`${flip} ${className ?? ""}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <g fill="currentColor">
        <path d="M50 200 C 47 160, 46 110, 48 70 L 52 70 C 54 110, 53 160, 50 200 Z" />
        <path d="M50 70 C 30 55, 18 50, 5 55 C 18 60, 30 65, 50 70 Z" />
        <path d="M50 70 C 35 45, 22 32, 8 30 C 22 38, 35 50, 50 70 Z" />
        <path d="M50 70 C 50 45, 50 25, 48 10 C 52 25, 52 45, 50 70 Z" />
        <path d="M50 70 C 65 55, 80 52, 92 56 C 80 60, 68 65, 50 70 Z" />
        <path d="M50 70 C 64 47, 78 35, 90 32 C 78 40, 64 52, 50 70 Z" />
      </g>
    </svg>
  );
}
