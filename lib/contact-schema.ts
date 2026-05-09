import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof ContactSchema>;
