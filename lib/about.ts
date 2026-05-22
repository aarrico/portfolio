import type { ComponentType } from "react";

export async function loadAboutSection(slug: string): Promise<ComponentType> {
  const body = await import(`@/content/about/${slug}.mdx`);
  return body.default;
}