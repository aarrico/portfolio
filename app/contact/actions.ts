"use server";

import { ContactSchema } from "@/lib/contact-schema";
import { getResend } from "@/lib/resend";

const MIN_TIME_ON_PAGE_MS = 3000;

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function sendContact(formData: FormData): Promise<ContactResult> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
    startedAt: Number(formData.get("startedAt") ?? 0),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check the form fields and try again." };
  }

  const elapsed = Date.now() - parsed.data.startedAt;
  if (elapsed < MIN_TIME_ON_PAGE_MS) {
    return { ok: false, error: "Submission flagged as spam." };
  }

  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!to || !from) {
    return { ok: false, error: "Contact form is not configured." };
  }

  try {
    await getResend().emails.send({
      to,
      from,
      replyTo: parsed.data.email,
      subject: `arrico.me — message from ${parsed.data.name}`,
      text: parsed.data.message,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send the message right now." };
  }
}
