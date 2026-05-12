export type SimParams = {
  MM: number;      // cells per unit length
  tmax: number;    // total sim time
  dtout: number;   // output cadence
  factor: number;  // CFL dt factor (>1 = blow up)
  a: number;       // left boundary
  b: number;       // right boundary
  D: number;       // diffusivity
  v: number;       // advection velocity
};

export type Snapshot = {
  t: number;
  /** Read-only views into wasm heap. Valid until the next step() call. */
  x: Float64Array;
  u: Float64Array;
};

export type PresetSlug = "calm" | "breezy" | "windy" | "blow-up";

export type Preset = {
  slug: PresetSlug;
  weatherLabel: string;   // "Calm day"
  mathLabel: string;      // "Diffusion only"
  params: SimParams;
};
