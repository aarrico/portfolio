import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden rounded-md border border-[color:var(--fg)]/10 bg-[color:var(--bg)] p-4 transition hover:border-[color:var(--accent)]"
    >
      <div className="relative aspect-video overflow-hidden rounded-sm">
        <Image
          src={project.thumbnail}
          alt={`${project.title} screenshot`}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, transparent 80%, var(--accent) 100%)",
          }}
        />
      </div>
      <h3 className="mt-3 font-sans text-lg font-semibold">{project.title}</h3>
      <p className="mt-1 text-sm opacity-80">{project.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 font-mono text-xs text-[color:var(--accent)]"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
