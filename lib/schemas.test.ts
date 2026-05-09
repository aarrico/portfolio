import { describe, it, expect } from "vitest";
import { ResumeSchema, ProjectsSchema } from "./schemas";

const validResume = {
  basics: {
    name: "Alexander Arrico",
    title: "Software Engineer",
    location: "Los Angeles, CA",
    email: "alex.arrico@gmail.com",
    links: {
      github: "https://github.com/aarrico",
      linkedin: "https://linkedin.com/in/aarrico",
      website: "https://arrico.me",
    },
  },
  summary: "Engineer.",
  experience: [
    {
      company: "Acme",
      role: "Engineer",
      start: "2020-01",
      end: null,
      location: "LA",
      bullets: ["Did the thing"],
    },
  ],
  education: [
    {
      school: "School",
      degree: "BS",
      start: "2014-09",
      end: "2018-05",
    },
  ],
  skills: [{ category: "Languages", items: ["TypeScript"] }],
};

describe("ResumeSchema", () => {
  it("accepts a valid resume", () => {
    expect(ResumeSchema.parse(validResume)).toEqual(validResume);
  });

  it("rejects invalid email", () => {
    const bad = { ...validResume, basics: { ...validResume.basics, email: "nope" } };
    expect(() => ResumeSchema.parse(bad)).toThrow();
  });

  it("rejects bad date format", () => {
    const bad = {
      ...validResume,
      experience: [{ ...validResume.experience[0], start: "January 2020" }],
    };
    expect(() => ResumeSchema.parse(bad)).toThrow();
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
