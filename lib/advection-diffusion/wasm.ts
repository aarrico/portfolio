import type { AdvDiffModule } from "@/types/adv-diff-module";
import type { SimParams } from "./types";
import createAdvDiffModule from "../../public/adv-diff/wasm-glue";

const isNodeLike =
  typeof process !== "undefined" && !!process.versions?.node;

let modulePromise: Promise<AdvDiffModule> | null = null;

async function readWasmBinaryNode(): Promise<ArrayBuffer> {
  const fs = await import(
    /* webpackIgnore: true */ /* @vite-ignore */ "node:fs/promises"
  );
  const url = await import(
    /* webpackIgnore: true */ /* @vite-ignore */ "node:url"
  );
  const path = await import(
    /* webpackIgnore: true */ /* @vite-ignore */ "node:path"
  );
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const wasmPath = path.resolve(
    here,
    "../../public/adv-diff/adv-diff.wasm",
  );
  const buf = await fs.readFile(wasmPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function loadModule(): Promise<AdvDiffModule> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    const opts: Partial<AdvDiffModule> & {
      locateFile?: (p: string) => string;
      wasmBinary?: ArrayBuffer;
    } = {
      locateFile: (p: string) =>
        p.endsWith(".wasm") ? "/adv-diff/adv-diff.wasm" : p,
    };
    if (isNodeLike) {
      opts.wasmBinary = await readWasmBinaryNode();
    }
    return createAdvDiffModule(opts);
  })();
  return modulePromise;
}

export class Simulation {
  private constructor(
    private readonly mod: AdvDiffModule,
    private ptr: number,
    private readonly _size: number,
  ) {}

  static async create(params: SimParams): Promise<Simulation> {
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
    if (!ptr) throw new Error("sim_create returned null pointer");
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

  /** Float64Array view into wasm heap. Invalidated by step()/dispose(). */
  get x(): Float64Array {
    this.assertAlive();
    const offset = this.mod._sim_get_x_ptr(this.ptr) / 8;
    return this.mod.HEAPF64.subarray(offset, offset + this._size);
  }

  /** Float64Array view into wasm heap. Invalidated by step()/dispose(). */
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
