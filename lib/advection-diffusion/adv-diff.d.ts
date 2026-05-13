import type { AdvDiffModule } from "@/types/adv-diff-module";

declare const createAdvDiffModule: (
  moduleArg?: Partial<AdvDiffModule> & {
    locateFile?: (p: string) => string;
    wasmBinary?: ArrayBuffer;
  },
) => Promise<AdvDiffModule>;

export default createAdvDiffModule;
