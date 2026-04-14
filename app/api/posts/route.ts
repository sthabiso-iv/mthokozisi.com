/**
 * GET /api/posts
 * Proxies paginated post requests to the WordPress REST API.
 * Used by the PostsGrid client component for infinite scroll.
 *
 * Query params:
 *   page       - page number (default: 1)
 *   per_page   - posts per page (default: 12, max: 100)
 *   cat        - category slug to filter by (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { getPosts, getCategoryBySlug } from "@/lib/wordpress";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page    = Math.max(1, parseInt(searchParams.get("page")     ?? "1",  10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "12", 10)));
  const catSlug = searchParams.get("cat")    ?? undefined;
  const search  = searchParams.get("search") ?? undefined;

  let categoryId: number | undefined;
  if (catSlug) {
    const category = await getCategoryBySlug(catSlug);
    if (!category) {
      return NextResponse.json({ posts: [], total: 0, totalPages: 0 });
    }
    categoryId = category.id;
  }

  try {
    const data = await getPosts({ page, perPage, categoryId, search });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[api/posts]", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
