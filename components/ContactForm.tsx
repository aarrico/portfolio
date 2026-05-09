"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendContact, type ContactResult } from "@/app/contact/actions";

const ClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof ClientSchema>;

type ContactFormProps = {
  action?: (formData: FormData) => Promise<ContactResult>;
};

export function ContactForm({ action = sendContact }: ContactFormProps) {
  const startedAt = useRef<number>(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ContactResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(ClientSchema) });

  // The ref is read inside the submit handler (event-driven, not render).
  // eslint-disable-next-line react-hooks/refs
  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("email", values.email);
      fd.set("message", values.message);
      fd.set("website", "");
      fd.set("startedAt", String(startedAt.current || Date.now()));
      const r = await action(fd);
      setResult(r);
      if (r.ok) reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm">Name</label>
        <input
          id="name"
          autoComplete="name"
          {...register("name")}
          className="mt-1 w-full rounded-sm border border-[color:var(--fg)]/20 bg-transparent px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-xs text-[color:var(--accent)]">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="mt-1 w-full rounded-sm border border-[color:var(--fg)]/20 bg-transparent px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
        />
        {errors.email && <p className="mt-1 text-xs text-[color:var(--accent)]">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="message" className="block text-sm">Message</label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className="mt-1 w-full rounded-sm border border-[color:var(--fg)]/20 bg-transparent px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
        />
        {errors.message && <p className="mt-1 text-xs text-[color:var(--accent)]">{errors.message.message}</p>}
      </div>

      {/* honeypot — hidden from real users */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Website (leave blank)</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm border border-[color:var(--accent)] px-4 py-2 text-sm hover:bg-[color:var(--accent)] hover:text-[color:var(--bg)] disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>

      {result?.ok && (
        <p className="text-center text-sm">
          Thanks — I&apos;ll get back to you soon.
        </p>
      )}
      {result && !result.ok && (
        <p className="text-center text-sm text-[color:var(--accent)]">
          {result.error}
        </p>
      )}
    </form>
  );
}
