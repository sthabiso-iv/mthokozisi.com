/**
 * app/go/[slug]/route.ts
 * Short-link redirector: mthokozisi.com/go/{slug} → /{category}/{post-slug}
 *
 * Looks up the slug in the URL Shortify endpoint on the WordPress blog,
 * parses the canonical WP permalink to extract category + post slug, and
 * issues a 307 redirect to the local canonical URL.
 */

import { NextRequest, NextResponse } from "next/server";

const SHORT_LINKS_URL = "https://blog.mthokozisi.com/wp-json/mthokozisi/v1/short-links";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const res = await fetch(SHORT_LINKS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("short-links fetch failed");

    const links: { slug: string; post_id: number; url: string }[] = await res.json();
    const match = links.find((l) => l.slug === slug);

    if (!match) {
      return NextResponse.redirect(new URL("/posts", request.url));
    }

    // Parse category + post slug from the WordPress permalink.
    // WP format: https://blog.mthokozisi.com/{category}/{post-slug}/
    const wpUrl  = new URL(match.url);
    const parts  = wpUrl.pathname.replace(/^\/|\/$/g, "").split("/");

    let redirectPath: string;

    if (parts.length >= 2) {
      const postSlug = parts[parts.length - 1];
      const category = parts[parts.length - 2];
      // Guard against date-based permalink structures (/2026/04/post-name/)
      const isDateSegment = /^\d{4}$/.test(category) || /^\d{2}$/.test(category);
      redirectPath = isDateSegment ? `/posts/${postSlug}` : `/${category}/${postSlug}`;
    } else {
      redirectPath = `/posts/${parts[0]}`;
    }

    return NextResponse.redirect(new URL(redirectPath, request.url), { status: 307 });
  } catch {
    return NextResponse.redirect(new URL("/posts", request.url));
  }
}
