import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/data";

const BASE = "https://arrico.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/projects", "/resume", "/contact"];
  const projectRoutes = getProjectSlugs().map((slug) => `/projects/${slug}`);
  const now = new Date();
  return [...staticRoutes, ...projectRoutes].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
