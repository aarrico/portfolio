import { notFound } from "next/navigation";
import type { ComponentType } from "react";

export async function loadProjectMDX(slug: string): Promise<ComponentType> {
  try {
    const mod = await import(`@/content/projects/${slug}.mdx`);
    return mod.default;
  } catch {
    notFound();
  }
}
