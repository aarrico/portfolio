import type { Metadata } from "next";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { getResume } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Alexander Arrico.",
};

function formatRange(start: string, end: string | null): string {
  return `${start} – ${end ?? "Present"}`;
}

export default function ResumePage() {
  const { basics, summary, experience, education, skills } = getResume();

  return (
    <>
      <InnerPageHeader title="RESUME" eyebrow={basics.title} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-widest">{basics.name}</h2>
            <p className="text-sm opacity-80">
              {basics.title} · {basics.location}
            </p>
          </div>
          <a
            href="/resume.pdf"
            className="rounded-sm border border-[color:var(--accent)] px-3 py-2 text-sm hover:bg-[color:var(--accent)] hover:text-[color:var(--bg)]"
          >
            Download PDF (ATS-friendly)
          </a>
        </header>

        <p className="mt-6 leading-relaxed">{summary}</p>

        <section className="mt-10">
          <h3 className="font-display text-lg tracking-widest">EXPERIENCE</h3>
          <ul className="mt-4 space-y-6">
            {experience.map((job) => (
              <li key={`${job.company}-${job.start}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {job.role} · {job.company}
                  </p>
                  <p className="font-mono text-xs opacity-70">
                    {formatRange(job.start, job.end)} · {job.location}
                  </p>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {job.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h3 className="font-display text-lg tracking-widest">EDUCATION</h3>
          <ul className="mt-4 space-y-3">
            {education.map((e) => (
              <li key={e.school} className="flex flex-wrap items-baseline justify-between gap-2">
                <p>
                  <span className="font-semibold">{e.degree}</span> · {e.school}
                </p>
                <p className="font-mono text-xs opacity-70">
                  {e.start} – {e.end}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h3 className="font-display text-lg tracking-widest">SKILLS</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {skills.map((g) => (
              <div key={g.category}>
                <p className="text-sm font-semibold uppercase opacity-70">{g.category}</p>
                <p className="mt-1 text-sm">{g.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
