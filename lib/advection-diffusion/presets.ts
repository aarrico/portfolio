import type { Preset, PresetSlug, SimParams } from "./types";

// Shared geometry across all presets. Only v, D, and factor vary.
const SHARED = {
  MM: 30,
  tmax: 12,
  dtout: 0.05,
  a: 0,
  b: 16,
} as const;

function params(v: number, D: number, factor: number): SimParams {
  return { ...SHARED, v, D, factor };
}

export const PRESETS: Record<PresetSlug, Preset> = {
  calm: {
    slug: "calm",
    weatherLabel: "Calm day",
    mathLabel: "Diffusion only",
    params: params(0.0, 0.8, 0.5),
  },
  breezy: {
    slug: "breezy",
    weatherLabel: "Breezy",
    mathLabel: "Advection + diffusion",
    params: params(1.0, 0.5, 0.5),
  },
  windy: {
    slug: "windy",
    weatherLabel: "Windy",
    mathLabel: "Advection-dominated",
    params: params(2.5, 0.1, 0.5),
  },
  // CFL teaching preset — safe to remove (delete this entry + the
  // matching branch in Playground.tsx).
  "blow-up": {
    slug: "blow-up",
    weatherLabel: "Blow-up",
    mathLabel: "CFL violation",
    params: params(2.5, 0.1, 2.0),
  },
};

/** Presets used in the hero ambient cycle (stable only). */
export const AMBIENT_CYCLE: readonly PresetSlug[] = ["calm", "breezy", "windy"];

/** Slider bounds for the interactive playground. */
export const SLIDER_RANGES = {
  v: { min: 0, max: 3, step: 0.1 },
  D: { min: 0, max: 1.5, step: 0.05 },
} as const;
