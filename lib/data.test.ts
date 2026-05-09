import { describe, it, expect } from "vitest";
import { getResume, getProjects, getFeaturedProjects, getProjectBySlug } from "./data";

describe("getResume", () => {
  it("returns a validated resume", () => {
    const r = getResume();
    expect(r.basics.name).toBe("Alexander Arrico");
  });
});

describe("getProjects", () => {
  it("returns projects sorted by order ascending", () => {
    const projects = getProjects();
    const orders = projects.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", () => {
    const featured = getFeaturedProjects();
    expect(featured.every((p) => p.featured)).toBe(true);
  });
});

describe("getProjectBySlug", () => {
  it("returns the project with matching slug", () => {
    const p = getProjectBySlug("portfolio");
    expect(p?.slug).toBe("portfolio");
  });

  it("returns undefined for unknown slug", () => {
    expect(getProjectBySlug("does-not-exist")).toBeUndefined();
  });
});
