import { describe, it, expect } from "vitest";
import { ContactSchema } from "./contact-schema";

describe("ContactSchema", () => {
  it("accepts a valid submission", () => {
    expect(
      ContactSchema.parse({
        name: "Alex",
        email: "alex@example.com",
        message: "Hello there, this is a real message.",
        website: "",
        startedAt: Date.now() - 5000,
      }),
    ).toBeDefined();
  });

  it("rejects bad email", () => {
    expect(() =>
      ContactSchema.parse({
        name: "Alex",
        email: "bad",
        message: "Hello there.",
        website: "",
        startedAt: Date.now() - 5000,
      }),
    ).toThrow();
  });

  it("rejects too-short message", () => {
    expect(() =>
      ContactSchema.parse({
        name: "A",
        email: "a@b.co",
        message: "hi",
        website: "",
        startedAt: Date.now() - 5000,
      }),
    ).toThrow();
  });
});
