#!/usr/bin/env node
// Reads the Fortran output files from ~/repos/advection-diffusion/ and produces
// lib/advection-diffusion/fortran-reference.json containing the U arrays at the
// chosen snapshot times for each preset. Run once after regenerating the
// Fortran outputs; the JSON is the test oracle.
//
// Usage: node scripts/build-fortran-reference.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const SRC_DIR = resolve(homedir(), "repos/advection-diffusion");
const OUT_FILE = resolve(
  process.cwd(),
  "lib/advection-diffusion/fortran-reference.json",
);

const PRESETS = {
  calm: { file: "calm-output.dat", v: 0.0, D: 0.8, factor: 0.5 },
  breezy: { file: "breezy-output.dat", v: 1.0, D: 0.5, factor: 0.5 },
  windy: { file: "windy-output.dat", v: 2.5, D: 0.1, factor: 0.5 },
  "blow-up": {
    file: "cfl-violation-output.dat",
    v: 2.5,
    D: 0.1,
    factor: 2.0,
  },
};

const SHARED = { MM: 30, tmax: 12, dtout: 0.05, a: 0, b: 16 };
const STABLE_TARGETS = [0.5, 1.0, 2.0, 4.0, 8.0];
const BLOWUP_TARGETS = [0.5];
const EXPECTED_CELLS = 482; // (b - a) * MM + 2 ghost cells

/**
 * Parse one Fortran output file into an array of { t, u[] } blocks.
 * Block layout (482 data rows per block):
 *   "Profile at time:    T.TTTT  nsteps=    N"
 *   "# Error up to this time:    X.XXXXXXE+NN"
 *   <EXPECTED_CELLS lines of "x  U">
 */
function parseFortranFile(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const header = lines[i];
    if (!header || !header.startsWith("Profile at time:")) {
      i++;
      continue;
    }
    const tMatch = header.match(/Profile at time:\s+([\d.\-+EeNaInf]+)/);
    if (!tMatch) {
      throw new Error(`Cannot parse t from header at ${path}:${i + 1}`);
    }
    const t = Number(tMatch[1]);
    // Skip header + error line.
    i += 2;
    const u = new Array(EXPECTED_CELLS);
    for (let j = 0; j < EXPECTED_CELLS; j++) {
      const row = lines[i + j];
      if (!row) {
        throw new Error(
          `Unexpected EOF mid-block at ${path}:${i + j + 1} (j=${j})`,
        );
      }
      const parts = row.trim().split(/\s+/);
      if (parts.length < 2) {
        throw new Error(
          `Malformed data row at ${path}:${i + j + 1}: "${row}"`,
        );
      }
      // Fortran writes NaN as "NaN" and Inf as "Infinity" or "+Inf" depending
      // on the runtime. Number() coerces both correctly.
      u[j] = Number(parts[1]);
    }
    blocks.push({ t, u });
    i += EXPECTED_CELLS;
  }
  return blocks;
}

/**
 * Pick the block whose t is nearest to target.
 */
function nearestSnapshot(blocks, target) {
  let best = blocks[0];
  let bestDiff = Math.abs(best.t - target);
  for (const b of blocks) {
    const d = Math.abs(b.t - target);
    if (d < bestDiff) {
      bestDiff = d;
      best = b;
    }
  }
  return best;
}

function buildPreset(slug, config) {
  const blocks = parseFortranFile(resolve(SRC_DIR, config.file));
  const targets = slug === "blow-up" ? BLOWUP_TARGETS : STABLE_TARGETS;
  const snapshots = targets.map((target) => {
    const block = nearestSnapshot(blocks, target);
    return { t: block.t, u: block.u };
  });
  return { v: config.v, D: config.D, factor: config.factor, snapshots };
}

function main() {
  const presets = {};
  for (const [slug, config] of Object.entries(PRESETS)) {
    process.stdout.write(`Reading ${config.file}… `);
    presets[slug] = buildPreset(slug, config);
    const t0 = presets[slug].snapshots[0].t;
    const last = presets[slug].snapshots[presets[slug].snapshots.length - 1];
    process.stdout.write(
      `${presets[slug].snapshots.length} snapshots (t=${t0.toFixed(2)}…${last.t.toFixed(2)})\n`,
    );
  }
  const out = { version: 1, shared: SHARED, presets };
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 0) + "\n");
  const sizeKb = (JSON.stringify(out).length / 1024).toFixed(1);
  console.log(`Wrote ${OUT_FILE} (${sizeKb} KB)`);
}

main();
