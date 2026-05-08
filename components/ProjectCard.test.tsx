import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/types";

const project: Project = {
  slug: "demo",
  title: "Demo Project",
  blurb: "A demo blurb.",
  tags: ["TypeScript", "React"],
  thumbnail: "/images/projects/demo.png",
  links: { repo: "https://github.com/x/y" },
  featured: true,
  order: 1,
  date: "2026-01",
};

describe("ProjectCard", () => {
  it("renders title, blurb, and tags", () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByText("Demo Project")).toBeInTheDocument();
    expect(screen.getByText("A demo blurb.")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("links to the project detail page", () => {
    render(<ProjectCard project={project} />);
    const link = screen.getByRole("link", { name: /demo project/i });
    expect(link).toHaveAttribute("href", "/projects/demo");
  });
});
