import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { loadAboutSection } from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Alexander Arrico — senior software engineer and tech leader.",
};

export default async function AboutPage() {
  const BiographyBody = await loadAboutSection("biography");

  return (
    <>
      <InnerPageHeader title="ABOUT" />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-invert mt-8 max-w-none">
          <BiographyBody />
        </div>
      </article>
    </>
  );
}

/* <div className="mt-4 grid gap-6 sm:grid-cols-2">
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
        </div> */
