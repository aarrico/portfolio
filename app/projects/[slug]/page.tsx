import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InnerPageHeader } from "@/components/aesthetic/InnerPageHeader";
import { getProjectBySlug, getProjectSlugs } from "@/lib/data";
import { loadProjectMDX } from "@/lib/mdx";

type RouteParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.blurb,
  };
}

export default async function ProjectDetailPage({ params }: RouteParams) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const Body = await loadProjectMDX(slug);

  return (
    <>
      <InnerPageHeader title={project.title.toUpperCase()} eyebrow={project.date} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="relative aspect-video overflow-hidden rounded-md">
          <Image
            src={project.thumbnail}
            alt={`${project.title} screenshot`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-[color:var(--accent)]/40 px-2 py-0.5 font-mono text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="prose prose-invert mt-8 max-w-none">
          <Body />
        </div>
        <div className="mt-8 flex gap-4 text-sm">
          {project.links.repo && (
            <a href={project.links.repo} target="_blank" rel="noreferrer" className="hover:text-[color:var(--accent)]">
              Source ↗
            </a>
          )}
          {project.links.demo && (
            <a href={project.links.demo} target="_blank" rel="noreferrer" className="hover:text-[color:var(--accent)]">
              Demo ↗
            </a>
          )}
          <Link href="/projects" className="ml-auto opacity-70 hover:text-[color:var(--accent)]">
            ← All projects
          </Link>
        </div>
      </article>
    </>
  );
}
