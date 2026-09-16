import { describe, expect, it, vi } from "vitest";
import { loadAboutSection } from "./about";
import { loadProjectBody } from "./projects";

vi.mock("@/content/about/career.mdx", () => {
  throw new Error("Broken about module");
});
vi.mock("@/content/projects/starly.mdx", () => {
  throw new Error("Broken project module");
});

describe("content loaders", () => {
  it("returns 404 for unknown content identifiers", async () => {
    for (const load of [loadAboutSection, loadProjectBody]) {
      await expect(load("missing")).rejects.toMatchObject({
        digest: "NEXT_HTTP_ERROR_FALLBACK;404",
      });
    }
  });

  it("preserves module failures for known identifiers", async () => {
    await expect(loadAboutSection("career")).rejects.not.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
    await expect(loadProjectBody("starly")).rejects.not.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });
});
