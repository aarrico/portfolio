import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  ProjectsSchema,
  listProjects,
  listFeaturedProjects,
  getProject,
} from "./projects";

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

describe("ProjectsSchema", () => {
  const project = {
    slug: "demo",
    title: "Demo",
    blurb: "A demo project.",
    tags: ["TypeScript"],
    thumbnail: "/images/projects/demo.png",
    links: { repo: "https://github.com/x/y" },
    featured: true,
    order: 1,
    date: "2025-01",
  };

  it("accepts a valid project list", () => {
    expect(ProjectsSchema.parse([project])).toEqual([project]);
  });

  it("rejects duplicate slugs", () => {
    expect(() => ProjectsSchema.parse([project, project])).toThrow();
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
