import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { IntroBand } from "@/components/about/IntroBand";
import { SectionNav } from "@/components/about/SectionNav";
import { loadAboutSection } from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "How a background in physics and supercomputing shaped my approach to software engineering and technical leadership.",
};

type SectionHeadingProps = {
  number: string;
  id: string;
  title: string;
};

function SectionHeading({ number, id, title }: SectionHeadingProps) {
  return (
    <header className="mb-8">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--accent)]">
        § {number}
      </p>
      <h2
        id={id}
        className="mt-2 font-display text-3xl tracking-[0.15em] text-[color:var(--fg)] sm:text-4xl"
      >
        {title}
      </h2>
      <div className="mt-3 h-px w-16 bg-[color:var(--accent)]/50" />
    </header>
  );
}

function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto my-16 flex max-w-3xl items-center justify-center gap-4 px-4"
    >
      <span className="h-px flex-1 bg-[color:var(--accent)]/20" />
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-[color:var(--accent)]/60">
        ✶
      </span>
      <span className="h-px flex-1 bg-[color:var(--accent)]/20" />
    </div>
  );
}

export default async function AboutPage() {
  const InspirationBody = await loadAboutSection("inspiration");
  const CareerBody = await loadAboutSection("career");
  const InterestsBody = await loadAboutSection("interests");

  return (
    <>
      <InnerPageHeader title="ABOUT" />

      <IntroBand
        name="Alexander Arrico"
        image="/images/about/headshot.jpg"
        alt="Portrait of Alexander Arrico"
      >
        A background in physics and supercomputing shapes how I approach
        software engineering and technical leadership. Currently bridging into
        learning the ropes of AI engineering, and building a Pokémon GO team
        optimizer on the side.
      </IntroBand>

      <SectionNav />

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-12">
        <section
          id="inspiration"
          aria-labelledby="inspiration-heading"
          className="scroll-mt-24"
        >
          <SectionHeading
            number="01"
            id="inspiration-heading"
            title="Inspiration"
          />
          <div className="prose prose-theme max-w-none">
            <InspirationBody />
          </div>
        </section>

        <SectionDivider />

        <section
          id="career"
          aria-labelledby="career-heading"
          className="scroll-mt-24"
        >
          <SectionHeading number="02" id="career-heading" title="Career" />
          <div className="prose prose-theme max-w-none">
            <CareerBody />
          </div>
        </section>

        <SectionDivider />

        <section
          id="interests"
          aria-labelledby="interests-heading"
          className="scroll-mt-24"
        >
          <SectionHeading
            number="03"
            id="interests-heading"
            title="Interests"
          />
          <div className="prose prose-theme max-w-none">
            <InterestsBody />
          </div>
        </section>
      </article>
    </>
  );
}
