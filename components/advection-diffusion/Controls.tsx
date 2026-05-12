"use client";

import { PRESETS, SLIDER_RANGES } from "@/lib/advection-diffusion/presets";
import type { PresetSlug } from "@/lib/advection-diffusion/types";

type Props = {
  activePreset: PresetSlug;
  v: number;
  D: number;
  playing: boolean;
  onPresetChange: (slug: PresetSlug) => void;
  onVChange: (v: number) => void;
  onDChange: (D: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onRelease: () => void;
};

const PRESET_ORDER: PresetSlug[] = ["calm", "breezy", "windy", "blow-up"];

export function Controls({
  activePreset,
  v,
  D,
  playing,
  onPresetChange,
  onVChange,
  onDChange,
  onTogglePlay,
  onReset,
  onRelease,
}: Props) {
  return (
    <div className="mt-4 grid gap-4 rounded-md border border-[color:var(--accent)]/30 p-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_ORDER.map((slug) => {
          const p = PRESETS[slug];
          const active = slug === activePreset;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onPresetChange(slug)}
              aria-pressed={active}
              className={[
                "rounded-md border px-3 py-2 text-left transition",
                active
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15"
                  : "border-[color:var(--accent)]/30 hover:bg-[color:var(--accent)]/5",
              ].join(" ")}
            >
              <div className="font-mono text-sm">{p.weatherLabel}</div>
              <div className="text-xs opacity-70">{p.mathLabel}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between font-mono">
            <span>Wind speed (v)</span>
            <span>{v.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={SLIDER_RANGES.v.min}
            max={SLIDER_RANGES.v.max}
            step={SLIDER_RANGES.v.step}
            value={v}
            onChange={(e) => onVChange(Number(e.target.value))}
            aria-label="Wind speed (v)"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between font-mono">
            <span>Atmospheric mixing (D)</span>
            <span>{D.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={SLIDER_RANGES.D.min}
            max={SLIDER_RANGES.D.max}
            step={SLIDER_RANGES.D.step}
            value={D}
            onChange={(e) => onDChange(Number(e.target.value))}
            aria-label="Atmospheric mixing (D)"
          />
        </label>
      </div>

      <div className="flex gap-2 font-mono text-sm">
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-md border border-[color:var(--accent)]/40 px-3 py-1"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          type="button"
          onClick={onRelease}
          className="rounded-md border border-[color:var(--accent)]/40 px-3 py-1"
        >
          ▶ Release
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[color:var(--accent)]/40 px-3 py-1"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
