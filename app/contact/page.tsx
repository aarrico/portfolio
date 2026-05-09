import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { ContactForm } from "@/components/ContactForm";
import { getResume } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Alexander Arrico.",
};

export default function ContactPage() {
  const { basics } = getResume();
  return (
    <>
      <InnerPageHeader title="CONTACT" />
      <section className="mx-auto grid max-w-3xl gap-12 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl tracking-widest">DIRECT</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${basics.email}`} className="hover:text-[color:var(--accent)]">
                {basics.email}
              </a>
            </li>
            <li>
              <a href={basics.links.linkedin} className="hover:text-[color:var(--accent)]" target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
            </li>
            <li>
              <a href={basics.links.github} className="hover:text-[color:var(--accent)]" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl tracking-widest">FORM</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
