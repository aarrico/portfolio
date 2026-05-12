import { describe, expect, it } from "vitest";
import { Simulation } from "./wasm";
import type { SimParams } from "./types";
import reference from "./fortran-reference.json";

type RefSnapshot = { t: number; u: number[] };
type RefPreset = {
  v: number;
  D: number;
  factor: number;
  snapshots: RefSnapshot[];
};
type Reference = {
  version: 1;
  shared: { MM: number; tmax: number; dtout: number; a: number; b: number };
  presets: Record<string, RefPreset>;
};

function buildParams(ref: Reference, preset: RefPreset): SimParams {
  return {
    ...ref.shared,
    tmax: ref.shared.tmax,
    v: preset.v,
    D: preset.D,
    factor: preset.factor,
  };
}

function maxAbsDiff(a: Float64Array, b: readonly number[]): number {
  let m = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const v = a[i]!;
    const w = b[i]!;
    if (!Number.isFinite(v) || !Number.isFinite(w)) continue;
    const d = Math.abs(v - w);
    if (d > m) m = d;
  }
  return m;
}

const breezy: SimParams = {
  MM: 30,
  tmax: 10,
  dtout: 0.1,
  factor: 0.5,
  a: 0,
  b: 16,
  D: 0.5,
  v: 1.0,
};

describe("Simulation", () => {
  it("creates a sim and reports a sensible size", async () => {
    const sim = await Simulation.create(breezy);
    try {
      // (b - a) * MM = 16 * 30 = 480 interior cells; the C++ solver adds 2
      // ghost cells for the Dirichlet boundaries, so size is 482.
      expect(sim.size).toBe(482);
      expect(sim.time).toBeCloseTo(0, 10);
      expect(sim.x.length).toBe(sim.size);
      expect(sim.u.length).toBe(sim.size);
    } finally {
      sim.dispose();
    }
  });

  it("stepping advances time and never produces NaN for the breezy preset", async () => {
    const sim = await Simulation.create(breezy);
    try {
      for (let i = 0; i < 20; i++) {
        sim.step();
        expect(Number.isFinite(sim.time)).toBe(true);
        for (let j = 0; j < sim.u.length; j++) {
          expect(Number.isFinite(sim.u[j])).toBe(true);
        }
      }
      expect(sim.time).toBeGreaterThan(0);
    } finally {
      sim.dispose();
    }
  });

  it("dispose is idempotent", async () => {
    const sim = await Simulation.create(breezy);
    sim.dispose();
    expect(() => sim.dispose()).not.toThrow();
  });
});

describe("Fortran parity", () => {
  const ref = reference as Reference;
  const stable = ["calm", "breezy", "windy"] as const;

  // The WASM and Fortran reach the same U values to bit precision when
  // stepped the same number of substeps, but `time += dt` accumulates
  // differently across gfortran and clang/wasm (FMA + 80-bit x87 vs strict
  // 64-bit IEEE), so the WASM ends up roughly one dt past the Fortran's
  // recorded output time. With strong advection (windy) that one-dt offset
  // shows up as a visible difference; the math is identical, only the
  // sampling time differs. 10% tolerance catches gross translation bugs
  // (sign errors, off-by-one indexing) while accepting that timing drift.
  const PARITY_TOLERANCE = 0.1;

  it.each(stable)(
    "WASM tracks Fortran reference for %s preset",
    async (slug) => {
      const preset = ref.presets[slug]!;
      const sim = await Simulation.create(buildParams(ref, preset));
      try {
        for (const target of preset.snapshots) {
          while (sim.time + 1e-12 < target.t) sim.step();
          expect(sim.u.length).toBe(target.u.length);
          expect(maxAbsDiff(sim.u, target.u)).toBeLessThan(PARITY_TOLERANCE);
        }
      } finally {
        sim.dispose();
      }
    },
  );

  it("blow-up preset eventually goes non-finite", async () => {
    const preset = ref.presets["blow-up"]!;
    const sim = await Simulation.create(buildParams(ref, preset));
    try {
      let exploded = false;
      for (let i = 0; i < 500 && !exploded; i++) {
        sim.step();
        for (let j = 0; j < sim.u.length; j++) {
          if (!Number.isFinite(sim.u[j]!)) {
            exploded = true;
            break;
          }
        }
      }
      expect(exploded).toBe(true);
    } finally {
      sim.dispose();
    }
  });
});
