import type { z } from "zod";
import type { ResumeSchema, ProjectSchema, ProjectsSchema } from "./schemas";

export type Resume = z.infer<typeof ResumeSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;
