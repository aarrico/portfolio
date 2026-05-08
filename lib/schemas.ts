import { z } from "zod";

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM");

export const ResumeSchema = z.object({
  basics: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    location: z.string().min(1),
    email: z.string().email(),
    links: z.object({
      github: z.string().url(),
      linkedin: z.string().url(),
      website: z.string().url(),
    }),
  }),
  summary: z.string().min(1),
  experience: z
    .array(
      z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        start: yearMonth,
        end: z.union([yearMonth, z.null()]),
        location: z.string().min(1),
        bullets: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  education: z.array(
    z.object({
      school: z.string().min(1),
      degree: z.string().min(1),
      start: yearMonth,
      end: yearMonth,
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
  ),
  projects: z.array(z.string().min(1)).optional(),
});

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "kebab-case slug"),
  title: z.string().min(1),
  blurb: z.string().min(1),
  tags: z.array(z.string().min(1)),
  thumbnail: z.string().regex(/^\//, "must be absolute path under /public"),
  links: z.object({
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
  }),
  featured: z.boolean(),
  order: z.number().int(),
  date: yearMonth,
});

export const ProjectsSchema = z
  .array(ProjectSchema)
  .superRefine((projects, ctx) => {
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
