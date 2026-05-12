import { AMBIENT_CYCLE } from "./presets";
import type { PresetSlug } from "./types";

export const AMBIENT_CYCLE_DURATION_S = 12;

export function nextAmbientPreset(
  current: PresetSlug,
  elapsedS: number,
): PresetSlug | null {
  if (current === "blow-up") return "calm";
  if (elapsedS < AMBIENT_CYCLE_DURATION_S) return null;
  const idx = AMBIENT_CYCLE.indexOf(current);
  if (idx === -1) return "calm";
  return AMBIENT_CYCLE[(idx + 1) % AMBIENT_CYCLE.length]!;
}
