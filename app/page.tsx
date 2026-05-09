import Link from "next/link";
import { GradientSky } from "@/components/aesthetic/GradientSky";
import { Sun } from "@/components/aesthetic/Sun";
import { Palm } from "@/components/aesthetic/Palm";
import { GridFloor } from "@/components/aesthetic/GridFloor";
import { Starfield } from "@/components/aesthetic/Starfield";
import { ProjectCard } from "@/components/ProjectCard";
import { getFeaturedProjects, getResume } from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const { basics, summary } = getResume();

  // Hero subline: prefer an intentional `headline`; otherwise fall back to
  // the first sentence of summary so a long bio doesn't crowd the hero.
  const tagline =
    basics.headline?.trim() || summary.split(/(?<=\.)\s+/)[0] || "";

  return (
    <>
      <GradientSky className="relative h-[80vh] min-h-[560px] w-full">
        {/* upper-sky stars */}
        <div className="absolute inset-x-0 top-0 h-[55%] opacity-70">
          <Starfield />
        </div>

        {/* sliced sun, sitting high so its bottom kisses the horizon.
            Outer div handles centering (Tailwind), inner handles the rise
            animation — keeping layout independent of motion so reduced-motion
            users still see a centered sun. */}
        <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
          <div className="sun-rise">
            <Sun size={360} />
          </div>
        </div>

        {/* perspective grid floor — brighter, denser, scanning */}
        <div
          className="absolute inset-x-0 top-[58%] bottom-0 text-[color:var(--gradient-stop-3)]"
          style={{ opacity: 0.72 }}
        >
          <GridFloor height={300} />
        </div>

        {/* palm cluster */}
        <div className="pointer-events-none absolute bottom-0 left-0 text-[color:var(--gradient-stop-1)]">
          <div className="absolute -left-6 bottom-0 opacity-90">
            <Palm side="left" height={300} />
          </div>
          <div className="absolute left-16 bottom-0 opacity-100">
            <Palm side="left" height={360} />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 text-[color:var(--gradient-stop-1)]">
          <div className="absolute -right-6 bottom-0 opacity-90">
            <Palm side="right" height={300} />
          </div>
          <div className="absolute right-16 bottom-0 opacity-100">
            <Palm side="right" height={360} />
          </div>
        </div>

        {/* readability scrim — soft radial darkening behind the title block */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[50%]"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 50% 80%, color-mix(in oklab, var(--gradient-stop-1) 70%, transparent) 0%, transparent 70%)",
          }}
        />

        {/* hero copy — anchored to the lower half, in front of grid + palms */}
        <div className="absolute inset-x-0 bottom-[2%] flex justify-center px-4">
          <div
            className="relative z-10 text-center"
            style={{
              color: "var(--color-gold)",
              textShadow:
                "0 0 14px color-mix(in oklab, var(--color-magenta) 75%, transparent), 0 2px 10px color-mix(in oklab, var(--gradient-stop-1) 85%, transparent)",
            }}
          >
            <p
              className="hero-rise font-mono text-xs uppercase tracking-[0.32em]"
              style={{
                color: "var(--color-peach)",
                animationDelay: "300ms",
              }}
            >
              {basics.location}
            </p>
            <h1
              className="hero-rise mt-2 font-display text-4xl tracking-widest sm:text-6xl"
              style={{ animationDelay: "500ms" }}
            >
              {basics.name.toUpperCase()}
            </h1>
            {tagline && (
              <p
                className="hero-rise mx-auto mt-4 max-w-md text-sm sm:text-base"
                style={{
                  color: "var(--color-gold)",
                  textShadow:
                    "0 1px 8px color-mix(in oklab, var(--gradient-stop-1) 90%, transparent)",
                  animationDelay: "750ms",
                }}
              >
                {tagline}
              </p>
            )}
            <div
              className="hero-rise mt-6 flex justify-center gap-4"
              style={{ animationDelay: "950ms" }}
            >
              <Link
                href="/projects"
                className="hero-button rounded-sm border px-4 py-2 text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/resume"
                className="hero-button rounded-sm border px-4 py-2 text-sm font-medium"
              >
                Resume
              </Link>
            </div>
          </div>
        </div>

        {/* hover styling for the buttons — kept in a style block to avoid client component */}
        <style>{`
          .hero-button {
            color: var(--color-gold);
            border-color: var(--color-gold);
            background-color: color-mix(in oklab, var(--gradient-stop-1) 35%, transparent);
            backdrop-filter: blur(2px);
            transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 200ms ease,
                        background-color 200ms ease;
          }
          .hero-button:hover {
            transform: translateY(-1px);
            background-color: color-mix(in oklab, var(--color-gold) 14%, transparent);
            box-shadow:
              0 0 0 1px color-mix(in oklab, var(--color-gold) 60%, transparent),
              0 0 18px color-mix(in oklab, var(--color-magenta) 70%, transparent),
              0 6px 20px color-mix(in oklab, var(--gradient-stop-1) 60%, transparent);
          }
        `}</style>
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
