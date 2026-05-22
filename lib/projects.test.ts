import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { listProjects, listFeaturedProjects, getProject } from "./projects";

describe("listProjects", () => {
  it("returns projects sorted by order ascending", () => {
    const projects = listProjects();
    const orders = projects.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("listFeaturedProjects", () => {
  it("returns only featured projects", () => {
    const featured = listFeaturedProjects();
    expect(featured.every((p) => p.featured)).toBe(true);
  });
});

describe("getProject", () => {
  it("returns the project with matching slug", () => {
    const p = getProject("portfolio");
    expect(p?.slug).toBe("portfolio");
  });

  it("returns null for unknown slug", () => {
    expect(getProject("does-not-exist")).toBeNull();
  });
});

describe("JSON↔MDX pairing", () => {
  it("every project JSON entry has a paired MDX body", () => {
    for (const p of listProjects()) {
      const path = resolve(`content/projects/${p.slug}.mdx`);
      expect(existsSync(path), `missing ${path} for project "${p.slug}"`).toBe(
        true,
      );
    }
  });
});
