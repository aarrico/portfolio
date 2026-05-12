// Ambient type declaration for the Emscripten-emitted ES module at
// /public/adv-diff/adv-diff.js. Mirrors the C signature:
//
//   AdvectionDiffusionSim* sim_create(int MM, double tmax, double dtout,
//                                     double factor, double a, double b,
//                                     double D, double v);

export interface AdvDiffModule {
  HEAPF64: Float64Array;
  HEAPU8: Uint8Array;
  _create_simulation: (
    MM: number,
    tmax: number,
    dtout: number,
    factor: number,
    a: number,
    b: number,
    D: number,
    v: number,
  ) => number; // pointer
  _delete_simulation: (ptr: number) => void;
  _sim_step: (ptr: number) => void;
  _sim_get_size: (ptr: number) => number;
  _sim_get_time: (ptr: number) => number;
  _sim_get_x_ptr: (ptr: number) => number;
  _sim_get_u_ptr: (ptr: number) => number;
}

declare module "/adv-diff/adv-diff.js" {
  export default function createAdvDiffModule(
    moduleArg?: Partial<AdvDiffModule> & { locateFile?: (p: string) => string },
  ): Promise<AdvDiffModule>;
}
