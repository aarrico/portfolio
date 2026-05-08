import Link from "next/link";
import { GradientSky } from "@/components/aesthetic/GradientSky";
import { Sun } from "@/components/aesthetic/Sun";
import { Palm } from "@/components/aesthetic/Palm";
import { HorizonLine } from "@/components/aesthetic/HorizonLine";
import { ProjectCard } from "@/components/ProjectCard";
import { getFeaturedProjects, getResume } from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const { basics, summary } = getResume();

  return (
    <>
      <GradientSky className="relative h-[80vh] min-h-[520px] w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <Sun size={420} className="absolute" />
          <div className="relative z-10 text-center text-[color:var(--gradient-stop-5)]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-80">
              {basics.location}
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-widest sm:text-7xl">
              {basics.name.toUpperCase()}
            </h1>
            <p className="mt-4 max-w-xl px-4 text-sm sm:text-base">{summary}</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/projects"
                className="rounded-sm border border-[color:var(--gradient-stop-5)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--gradient-stop-5)] hover:text-[color:var(--gradient-stop-1)]"
              >
                Projects
              </Link>
              <Link
                href="/resume"
                className="rounded-sm border border-[color:var(--gradient-stop-5)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--gradient-stop-5)] hover:text-[color:var(--gradient-stop-1)]"
              >
                Resume
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-0 text-[color:var(--gradient-stop-1)]">
          <Palm side="left" height={260} />
        </div>
        <div className="absolute bottom-12 right-0 text-[color:var(--gradient-stop-1)]">
          <Palm side="right" height={260} />
        </div>
        <HorizonLine className="absolute bottom-8 left-0 right-0" />
      </GradientSky>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-widest">FEATURED</h2>
          <Link href="/projects" className="text-sm hover:text-[color:var(--accent)]">
            All projects →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
