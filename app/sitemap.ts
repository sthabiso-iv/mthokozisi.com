/**
 * app/sitemap.ts
 * Generates /sitemap.xml — includes static pages and all WP blog posts.
 * Revalidates every hour so new posts appear quickly.
 */

import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/wordpress";
import { meta } from "@/data/portfolio";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = meta.siteUrl;

  // ── Static pages ───────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // ── Blog post pages ────────────────────────────────────────
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPostSlugs();
    postRoutes = slugs.map((slug) => ({
      url: `${base}/posts/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // If WP API is unreachable, return static routes only
  }

  return [...staticRoutes, ...postRoutes];
}
