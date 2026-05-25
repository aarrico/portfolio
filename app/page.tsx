import Link from "next/link";
import { GradientSky } from "@/components/aesthetic/GradientSky";
import { Sun } from "@/components/aesthetic/Sun";
import { Palm } from "@/components/aesthetic/Palm";
import { GridFloor } from "@/components/aesthetic/GridFloor";
import { Starfield } from "@/components/aesthetic/Starfield";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listFeaturedProjects } from "@/lib/projects";
import { getResume } from "@/lib/resume";

const PALM_SCALE =
  "scale(clamp(0.55, calc(0.55 + 0.45 * (100vw - 360px) / 664px), 1))";

export default function HomePage() {
  const featured = listFeaturedProjects();
  const { basics, summary } = getResume();

  const tagline =
    basics.headline?.trim() || summary.split(/(?<=\.)\s+/)[0] || "";

  return (
    <main className="flex-1">
      <GradientSky className="relative h-[80vh] min-h-140 w-full">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>

        <div className="absolute inset-x-0 top-0 h-[55%] opacity-70">
          <Starfield />
        </div>

        {/* sliced sun, sitting high so its bottom kisses the horizon.
            Outer div handles centering (Tailwind), inner handles the rise
            animation — keeping layout independent of motion so reduced-motion
            users still see a centered sun. */}
        <div className="absolute left-1/2 top-[2%] -translate-x-1/2 sm:top-[6%]">
          <div className="origin-top scale-[0.65] sm:scale-100">
            <div className="sun-rise">
              <Sun size={360} />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[58%] bottom-0 text-(--accent)">
          <GridFloor height={300} />
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 text-(--gradient-stop-1)">
          <div
            className="absolute -left-6 bottom-0 origin-bottom-left opacity-90"
            style={{ transform: PALM_SCALE }}
          >
            <Palm side="left" height={300} />
          </div>
          <div
            className="absolute left-16 bottom-0 hidden origin-bottom-left opacity-100 sm:block"
            style={{ transform: PALM_SCALE }}
          >
            <Palm side="left" height={360} />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 text-(--gradient-stop-1)">
          <div
            className="absolute -right-6 bottom-0 origin-bottom-right opacity-90"
            style={{ transform: PALM_SCALE }}
          >
            <Palm side="right" height={300} />
          </div>
          <div
            className="absolute right-16 bottom-0 hidden origin-bottom-right opacity-100 sm:block"
            style={{ transform: PALM_SCALE }}
          >
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

        {/* title block — high on mobile to clear the (scaled-down) palm
            canopy, and low on sm+ where the sun is full-size and would
            otherwise sit behind the title */}
        <div className="absolute inset-x-0 bottom-[42%] flex justify-center px-4 sm:bottom-[14%]">
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
          </div>
        </div>

        {/* button row — travels with the title; high on narrow screens to
            stay grouped above the palms, low on wide screens between the
            palm trunks */}
        <div className="absolute inset-x-0 bottom-[34%] flex justify-center px-4 sm:bottom-[5%]">
          <div
            className="hero-rise relative z-10 flex flex-wrap justify-center gap-2 sm:gap-4"
            style={{
              color: "var(--color-gold)",
              animationDelay: "950ms",
            }}
          >
            <Link
              href="/about"
              className="hero-button rounded-sm border px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2"
            >
              About
            </Link>
            <Link
              href="/projects"
              className="hero-button rounded-sm border px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2"
            >
              Projects
            </Link>
            <Link
              href="/resume"
              className="hero-button rounded-sm border px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2"
            >
              Resume
            </Link>
            <Link
              href="/contact"
              className="hero-button rounded-sm border px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2"
            >
              Contact
            </Link>
          </div>
        </div>

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
          <Link href="/projects" className="text-sm hover:text-(--accent)">
            All projects →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
