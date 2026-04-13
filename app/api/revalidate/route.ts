/**
 * app/api/revalidate/route.ts
 *
 * On-demand cache purge for all blog content.
 *
 * Usage:
 *   GET /api/revalidate?secret=YOUR_REVALIDATE_SECRET
 *
 * Optional — purge a single path only:
 *   GET /api/revalidate?secret=...&path=/posts/some-category
 *
 * Set REVALIDATE_SECRET in .env.local and in Vercel environment variables.
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const path   = req.nextUrl.searchParams.get("path");

  // ── Auth check ───────────────────────────────────────────────
  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured on this server." },
      { status: 500 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 401 });
  }

  // ── Revalidate ───────────────────────────────────────────────
  const purged: string[] = [];

  if (path) {
    // Single path requested
    revalidatePath(path, "page");
    purged.push(path);
  } else {
    // Full blog purge — covers all ISR pages that source from WordPress
    const paths: Array<[string, "page" | "layout"]> = [
      ["/",                    "layout"], // home (recent posts section)
      ["/posts",               "page"],  // all-posts listing
      ["/posts/[slug]",        "page"],  // category pages + post redirects
      ["/[category]/[slug]",   "page"],  // canonical post pages
    ];

    for (const [p, type] of paths) {
      revalidatePath(p, type);
      purged.push(p);
    }
  }

  return NextResponse.json({
    revalidated: true,
    purged,
    timestamp: new Date().toISOString(),
  });
}
