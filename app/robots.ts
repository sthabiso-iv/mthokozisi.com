/**
 * app/robots.ts
 * Generates /robots.txt — allows all crawlers, points to sitemap,
 * disallows /api/ routes.
 */

import type { MetadataRoute } from "next";
import { meta } from "@/data/portfolio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${meta.siteUrl}/sitemap.xml`,
  };
}
