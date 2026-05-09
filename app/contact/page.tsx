import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { ContactForm } from "@/components/ContactForm";
import { getResume } from "@/lib/data";
import SocialLinks from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Alexander Arrico.",
};

export default function ContactPage() {
  const { basics } = getResume();
  return (
    <>
      <InnerPageHeader title="CONTACT" />
      <section className="mx-auto max-w-md px-4 py-12">
        {/* Direct block — centered */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-xl tracking-widest">DIRECT</h2>
          <a
            href={`mailto:${basics.email}`}
            className="mt-4 text-sm hover:text-[color:var(--accent)]"
          >
            {basics.email}
          </a>
          <div className="mt-4">
            <SocialLinks direction="horizontal" />
          </div>
        </div>

        {/* Separator */}
        <div
          className="my-10 flex items-center gap-4 text-xs uppercase tracking-[0.3em] opacity-60"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-[color:var(--fg)]/20" />
          <span>or</span>
          <span className="h-px flex-1 bg-[color:var(--fg)]/20" />
        </div>

        {/* Form block — centered heading, full-width form below */}
        <div>
          <h2 className="text-center font-display text-xl tracking-widest">
            FORM
          </h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
