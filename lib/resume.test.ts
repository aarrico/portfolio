import { describe, it, expect } from "vitest";
import { getResume, ResumeSchema } from "./resume";

describe("getResume", () => {
  it("returns a validated resume", () => {
    const r = getResume();
    expect(r.basics.name).toBe("Alexander Arrico");
  });
});

describe("ResumeSchema", () => {
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

  it("accepts a valid resume", () => {
    expect(ResumeSchema.parse(validResume)).toEqual(validResume);
  });

  it("rejects invalid email", () => {
    const bad = {
      ...validResume,
      basics: { ...validResume.basics, email: "nope" },
    };
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
