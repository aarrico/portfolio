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

  // Resend's SDK does NOT throw on API errors — it returns { data, error }.
  // Inspect `error` explicitly; otherwise misconfigurations (unverified domain,
  // bad API key, etc.) silently report success while no email is sent.
  const idempotencyKey = `contact-form/${parsed.data.startedAt}-${parsed.data.email}`;
  const { data, error } = await getResend().emails.send(
    {
      to,
      from,
      replyTo: parsed.data.email,
      subject: `arrico.me — message from ${parsed.data.name}`,
      text: parsed.data.message,
    },
    { idempotencyKey },
  );

  if (error) {
    console.error("[contact] resend error:", error);
    return { ok: false, error: "Could not send the message right now." };
  }
  console.log("[contact] resend ok, id:", data?.id);
  return { ok: true };
}
