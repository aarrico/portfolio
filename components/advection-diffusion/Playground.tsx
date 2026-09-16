"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSimulationClock } from "@/lib/use-simulation-clock";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const ambientTimeRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [prevResetKey, setPrevResetKey] = useState<string>(
    `${mode}:${preset}:${v}:${D}:${releaseTick}`,
  );
  const resetKey = `${mode}:${preset}:${v}:${D}:${releaseTick}`;
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
    let sim: Simulation | null = null;
    ambientTimeRef.current = 0;

    (async () => {
      const newSim = await Simulation.create(buildParams());
      if (cancelled) {
        newSim.dispose();
        return;
      }
      sim = newSim;
      simulationRef.current = newSim;
      setError(false);

      let umax = 0;
      for (let i = 0; i < newSim.u.length; i++) {
        const val = newSim.u[i] ?? 0;
        if (val > umax) umax = val;
      }
      setUMax(Math.max(0.001, umax));

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReduced(reduced);
      setReady(true);
      if (mode === "ambient" && reduced) {
        for (let steps = 0; newSim.time < 2.0 && steps < 10_000; steps++) {
          const previousTime = newSim.time;
          newSim.step();
          if (!Number.isFinite(newSim.time) || newSim.time <= previousTime) {
            throw new Error("Simulation did not advance");
          }
        }
        setSnapshot({
          t: newSim.time,
          x: newSim.x.slice(),
          u: newSim.u.slice(),
        });
        return;
      }

      setSnapshot({ t: newSim.time, x: newSim.x.slice(), u: newSim.u.slice() });
    })().catch(() => {
      if (!cancelled) {
        simulationRef.current = null;
        sim?.dispose();
        sim = null;
        setSnapshot(null);
        setError(true);
        setReady(false);
      }
    });

    return () => {
      cancelled = true;
      simulationRef.current = null;
      sim?.dispose();
    };
  }, [buildParams, mode, preset, releaseTick]);

  useSimulationClock(
    containerRef,
    ready && playing && !exploded && !(mode === "ambient" && reduced),
    (steps) => {
      const sim = simulationRef.current;
      if (!sim) return;
      for (let i = 0; i < steps; i++) {
        sim.step();
        if (
          !Number.isFinite(sim.time) ||
          sim.u.some((value) => !Number.isFinite(value))
        ) {
          setExploded(true);
          return;
        }
      }
      setSnapshot({ t: sim.time, x: sim.x.slice(), u: sim.u.slice() });
      if (mode === "ambient") {
        ambientTimeRef.current += steps / 60;
        const next = nextAmbientPreset(preset, ambientTimeRef.current);
        if (next && next !== preset) setPreset(next);
      }
    },
  );

  const handlePresetChange = (slug: PresetSlug) => {
    setPreset(slug);
    const p = PRESETS[slug].params;
    setV(p.v);
    setD(p.D);
  };

  const handleRelease = () => {
    ambientTimeRef.current = 0;
    setReleaseTick((t) => t + 1);
  };

  return (
    <div ref={containerRef} className="my-6">
      {error && (
        <div role="alert">
          <p>The simulation could not load.</p>
          <button type="button" onClick={handleRelease}>
            Retry
          </button>
        </div>
      )}
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
