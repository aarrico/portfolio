"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "./Scene";
import { Curve } from "./Curve";
import { Controls } from "./Controls";
import { Simulation } from "@/lib/advection-diffusion/wasm";
import { PRESETS } from "@/lib/advection-diffusion/presets";
import { nextAmbientPreset } from "@/lib/advection-diffusion/ambient";
import type {
  PresetSlug,
  SimParams,
  Snapshot,
} from "@/lib/advection-diffusion/types";

type Mode = "ambient" | "interactive";

type PlaygroundProps = { mode: Mode };

const INITIAL_PRESET: PresetSlug = "breezy";

export function Playground({ mode }: PlaygroundProps) {
  const [preset, setPreset] = useState<PresetSlug>(
    mode === "ambient" ? "calm" : INITIAL_PRESET,
  );
  const [v, setV] = useState<number>(PRESETS[INITIAL_PRESET].params.v);
  const [D, setD] = useState<number>(PRESETS[INITIAL_PRESET].params.D);
  const [playing, setPlaying] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [exploded, setExploded] = useState<boolean>(false);
  const [releaseTick, setReleaseTick] = useState<number>(0);
  const [uMax, setUMax] = useState<number>(1);

  const presetStartRef = useRef<number>(0);
  const explodedRef = useRef<boolean>(false);

  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);

  const [prevResetKey, setPrevResetKey] = useState<string>(
    `${preset}:${releaseTick}`,
  );
  const resetKey = `${preset}:${releaseTick}`;
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setExploded(false);
  }

  const buildParams = useCallback((): SimParams => {
    const base = PRESETS[preset].params;
    if (mode === "interactive" && preset !== "blow-up") {
      return { ...base, v, D };
    }
    return base;
  }, [mode, preset, v, D]);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let sim: Simulation | null = null;
    presetStartRef.current = performance.now();

    (async () => {
      const newSim = await Simulation.create(buildParams());
      if (cancelled) {
        newSim.dispose();
        return;
      }
      sim = newSim;

      let umax = 0;
      for (let i = 0; i < newSim.u.length; i++) {
        const val = newSim.u[i] ?? 0;
        if (val > umax) umax = val;
      }
      setUMax(Math.max(0.001, umax));

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (mode === "ambient" && reduced) {
        while (newSim.time < 2.0 && Number.isFinite(newSim.time)) newSim.step();
        setSnapshot({ t: newSim.time, x: newSim.x, u: newSim.u });
        return;
      }

      setSnapshot({ t: newSim.time, x: newSim.x, u: newSim.u });

      const loop = (nowMs: number) => {
        if (cancelled || !sim) return;
        if (playing && !explodedRef.current) {
          sim.step();
          let bad = false;
          for (let i = 0; i < sim.u.length; i++) {
            if (!Number.isFinite(sim.u[i]!)) {
              bad = true;
              break;
            }
          }
          if (bad) {
            setExploded(true);
          } else {
            setSnapshot({ t: sim.time, x: sim.x, u: sim.u });
          }

          if (mode === "ambient") {
            const elapsed = (nowMs - presetStartRef.current) / 1000;
            const next = nextAmbientPreset(preset, elapsed);
            if (next && next !== preset) {
              setPreset(next);
              return;
            }
          }
        }
        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      sim?.dispose();
    };
  }, [buildParams, mode, playing, preset, releaseTick]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const handlePresetChange = (slug: PresetSlug) => {
    setPreset(slug);
    const p = PRESETS[slug].params;
    setV(p.v);
    setD(p.D);
  };

  const handleRelease = () => {
    presetStartRef.current = performance.now();
    setReleaseTick((t) => t + 1);
  };

  return (
    <div className="my-6">
      {snapshot && (
        <>
          <Scene
            snapshot={snapshot}
            uMax={uMax}
            className="h-64 w-full rounded-md"
          />
          <Curve
            snapshot={snapshot}
            uMax={uMax}
            className="mt-2 h-48 w-full rounded-md"
          />
        </>
      )}
      {exploded && (
        <div className="mt-2 rounded-md border border-red-500/50 bg-red-500/10 p-3 font-mono text-sm">
          The scheme has gone unstable. dt exceeded the CFL bound. Hit ↺ to
          reset.
        </div>
      )}
      {mode === "interactive" && (
        <Controls
          activePreset={preset}
          v={v}
          D={D}
          playing={playing}
          onPresetChange={handlePresetChange}
          onVChange={setV}
          onDChange={setD}
          onTogglePlay={() => setPlaying((p) => !p)}
          onReset={handleRelease}
          onRelease={handleRelease}
        />
      )}
    </div>
  );
}
