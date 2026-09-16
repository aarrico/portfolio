import { notFound } from "next/navigation";
import type { ComponentType } from "react";

export async function loadAboutSection(slug: string): Promise<ComponentType> {
  if (!["career", "inspiration", "interests"].includes(slug)) notFound();
  const body = await import(`@/content/about/${slug}.mdx`);
  return body.default;
}
