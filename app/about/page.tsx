import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { getResume } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "About Alexander Arrico — senior software engineer and tech leader.",
};

export default function AboutPage() {
  const { basics, summary, skills } = getResume();
  return (
    <>
      <InnerPageHeader title="ABOUT" eyebrow={basics.location} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-lg leading-relaxed">{summary}</p>
        <h2 className="mt-12 font-display text-xl tracking-widest">SKILLS</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wide opacity-70">
                {group.category}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-[color:var(--accent)]/40 px-2 py-0.5 font-mono text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
