/**
 * app/api/image/route.ts
 * Proxies images from blog.mthokozisi.com so the origin is never
 * exposed to visitors in src attributes, network requests, or devtools.
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = "blog.mthokozisi.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_ORIGIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: { "User-Agent": "mthokozisi.com/imageproxy" },
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
