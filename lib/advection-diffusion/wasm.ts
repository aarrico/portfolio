import type { AdvDiffModule } from "@/types/adv-diff-module";
import type { SimParams } from "./types";
import loadWasm from "./adv-diff.js";

let modulePromise: Promise<AdvDiffModule> | null = null;

function loadModule(): Promise<AdvDiffModule> {
  if (modulePromise) return modulePromise;
  
  modulePromise = loadWasm().then((mod) => mod as AdvDiffModule);
  if (!modulePromise) { 
    throw new Error("could not load wasm module")
  }
  return modulePromise;
}

export class Simulation {
  private constructor(
    private readonly mod: AdvDiffModule,
    private ptr: number,
    private readonly _size: number,
  ) {}

  static async create(params: SimParams & { shape?: number }): Promise<Simulation> {
    const mod = await loadModule();

    const ptr = mod._create_simulation(
      params.MM,
      params.tmax,
      params.dtout,
      params.factor,
      params.a,
      params.b,
      params.D,
      params.v,
    );
    
    if (!ptr) throw new Error("create_simulation returned null pointer");
    const size = mod._sim_get_size(ptr);
    return new Simulation(mod, ptr, size);
  }

  get size(): number {
    return this._size;
  }

  get time(): number {
    this.assertAlive();
    return this.mod._sim_get_time(this.ptr);
  }

  get x(): Float64Array {
    this.assertAlive();
    const offset = this.mod._sim_get_x_ptr(this.ptr) / 8;
    return this.mod.HEAPF64.subarray(offset, offset + this._size);
  }

  get u(): Float64Array {
    this.assertAlive();
    const offset = this.mod._sim_get_u_ptr(this.ptr) / 8;
    return this.mod.HEAPF64.subarray(offset, offset + this._size);
  }

  step(): void {
    this.assertAlive();
    this.mod._sim_step(this.ptr);
  }

  dispose(): void {
    if (this.ptr === 0) return;
    this.mod._delete_simulation(this.ptr);
    this.ptr = 0;
  }

  private assertAlive(): void {
    if (this.ptr === 0) throw new Error("Simulation already disposed");
  }
}