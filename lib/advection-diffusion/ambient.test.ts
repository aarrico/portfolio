import { describe, expect, it } from "vitest";
import { nextAmbientPreset } from "./ambient";

describe("nextAmbientPreset", () => {
  it("returns null before the cycle duration elapses", () => {
    expect(nextAmbientPreset("calm", 5)).toBeNull();
  });

  it("advances to the next preset after the cycle duration", () => {
    expect(nextAmbientPreset("calm", 13)).toBe("breezy");
    expect(nextAmbientPreset("breezy", 13)).toBe("windy");
  });

  it("wraps back to calm after windy", () => {
    expect(nextAmbientPreset("windy", 13)).toBe("calm");
  });

  it("treats blow-up as not in the cycle (starts at calm)", () => {
    expect(nextAmbientPreset("blow-up", 0)).toBe("calm");
  });
});
