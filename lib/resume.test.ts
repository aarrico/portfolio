import { describe, it, expect } from "vitest";
import { getResume } from "./resume";

describe("getResume", () => {
  it("returns a validated resume", () => {
    const r = getResume();
    expect(r.basics.name).toBe("Alexander Arrico");
  });
});
