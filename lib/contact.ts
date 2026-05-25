import { Resend } from "resend";
import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

let cached: Resend | null = null;

export function getEmailClient(): Resend {
  if (!cached) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    cached = new Resend(key);
  }
  return cached;
}
