"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

const STEP_MS = 1000 / 60;
const MAX_CATCH_UP_STEPS = 5;

export function useSimulationClock(
  container: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  advance: (steps: number) => void,
) {
  const onAdvance = useEffectEvent(advance);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let visible = true;
    let previous = performance.now();
    let remainder = 0;

    const loop = (now: number) => {
      remainder += Math.min(now - previous, STEP_MS * MAX_CATCH_UP_STEPS);
      previous = now;
      const steps = Math.floor((remainder + 1e-8) / STEP_MS);
      remainder = Math.max(0, remainder - steps * STEP_MS);
      if (steps > 0) onAdvance(steps);
      raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      cancelAnimationFrame(raf);
      previous = performance.now();
      remainder = 0;
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    });
    if (container.current) observer.observe(container.current);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [container, enabled]);
}
