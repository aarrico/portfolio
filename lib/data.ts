import resumeJson from "@/data/resume.json";
import projectsJson from "@/data/projects.json";
import { ResumeSchema, ProjectsSchema } from "./schemas";
import type { Resume, Project, Projects } from "./types";

let cachedResume: Resume | null = null;
let cachedProjects: Projects | null = null;

export function getResume(): Resume {
  if (!cachedResume) {
    cachedResume = ResumeSchema.parse(resumeJson);
  }
  return cachedResume;
}

export function getProjects(): Projects {
  if (!cachedProjects) {
    const parsed = ProjectsSchema.parse(projectsJson);
    cachedProjects = [...parsed].sort((a, b) => a.order - b.order);
  }
  return cachedProjects;
}

export function getFeaturedProjects(): Projects {
  return getProjects().filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}
