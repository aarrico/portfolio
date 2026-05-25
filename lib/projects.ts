import projectsJson from "@/data/projects.json";
import { notFound } from "next/navigation";
import { z } from "zod";
import type { ComponentType } from "react";

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM");

const ProjectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "kebab-case slug"),
    title: z.string().min(1),
    blurb: z.string().min(1),
    tags: z.array(z.string().min(1)),
    thumbnail: z
      .string()
      .regex(/^\//, "must be absolute path under /public")
      .optional(),
    thumbnailKind: z.enum(["image", "site-preview"]).optional().default("image"),
    links: z.object({
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
    }),
    featured: z.boolean(),
    order: z.number().int(),
    date: yearMonth,
  })
  .refine((p) => p.thumbnailKind === "site-preview" || !!p.thumbnail, {
    message: "thumbnail is required when thumbnailKind is 'image'",
    path: ["thumbnail"],
  });

export const ProjectsSchema = z.array(ProjectSchema).superRefine((projects, ctx) => {
  const slugs = new Set<string>();
  for (const p of projects) {
    if (slugs.has(p.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate slug: ${p.slug}`,
      });
    }
    slugs.add(p.slug);
  }
});

export type Project = z.infer<typeof ProjectSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;

const PROJECTS: Projects = ProjectsSchema.parse(projectsJson).sort(
  (a, b) => a.order - b.order,
);

export function listProjects() {
  return PROJECTS;
}
export function listFeaturedProjects() {
  return PROJECTS.filter((p) => p.featured);
}
export function listProjectSlugs() {
  return PROJECTS.map((p) => p.slug);
}
export function getProject(slug: string): Project | null {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}

export async function loadProjectBody(slug: string): Promise<ComponentType> {
  try {
    const body = await import(`@/content/projects/${slug}.mdx`);
    return body.default;
  } catch {
    notFound();
  }
}
