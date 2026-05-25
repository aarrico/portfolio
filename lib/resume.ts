import resumeJson from "@/data/resume.json";
import { z } from "zod";

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM");

export const ResumeSchema = z.object({
  basics: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    headline: z.string().min(1).max(160).nullable().optional(),
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

export type Resume = z.infer<typeof ResumeSchema>;

const RESUME: Resume = ResumeSchema.parse(resumeJson);

export function getResume(): Resume {
  return RESUME;
}
