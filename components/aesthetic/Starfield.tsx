type StarfieldProps = {
  className?: string;
  count?: number;
  seed?: number;
};

/**
 * Deterministic sparse starfield. Each star is a fixed-size DOM dot positioned
 * in percent — that way they stay circular at any container aspect ratio
 * (an SVG circle in a stretched viewBox becomes a horizontal sliver).
 */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function Starfield({ className, count = 90, seed = 7 }: StarfieldProps) {
  const r = rand(seed);
  const stars = Array.from({ length: count }, (_, i) => {
    const size = 0.6 + r() * 1.6; // 0.6 – 2.2 px diameter
    return {
      i,
      left: r() * 100,
      top: r() * 100,
      size,
      opacity: 0.45 + r() * 0.5,
      twinkle: 2.8 + r() * 5.5,
      delay: r() * 5,
      // ~10% of stars get a soft halo
      halo: r() < 0.1,
    };
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-full w-full overflow-hidden ${className ?? ""}`}
    >
      {stars.map((st) => (
        <span
          key={st.i}
          className="star"
          style={{
            left: `${st.left}%`,
            top: `${st.top}%`,
            width: `${st.size}px`,
            height: `${st.size}px`,
            opacity: st.opacity,
            animationDuration: `${st.twinkle}s`,
            animationDelay: `${st.delay}s`,
            boxShadow: st.halo
              ? `0 0 ${st.size * 2.5}px ${st.size * 0.6}px color-mix(in oklab, var(--color-gold) 60%, transparent)`
              : undefined,
          }}
        />
      ))}
      <style>{`
        .star {
          position: absolute;
          border-radius: 9999px;
          background: var(--color-gold);
          transform: translate(-50%, -50%);
          animation-name: star-tw;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        @keyframes star-tw {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .star { animation: none; }
        }
      `}</style>
    </div>
  );
}
