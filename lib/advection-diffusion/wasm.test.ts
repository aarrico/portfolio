import { describe, expect, it } from "vitest";
import { Simulation } from "./wasm";
import type { SimParams } from "./types";

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
