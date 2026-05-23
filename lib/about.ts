import { notFound } from "next/navigation";
import type { ComponentType } from "react";

export async function loadAboutSection(slug: string): Promise<ComponentType> {
  try {
    const body = await import(`@/content/about/${slug}.mdx`);
    return body.default;
  } catch {
    notFound();
  }
}