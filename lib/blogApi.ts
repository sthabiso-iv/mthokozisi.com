/**
 * lib/blogApi.ts
 * Single entry-point for all server-side WordPress REST API requests.
 *
 * Every call automatically includes the X-Blog-Token header so the
 * .htaccess gate passes. The token is a server-only secret and is
 * NEVER sent to the browser.
 *
 * Usage:
 *   import { blogFetch } from '@/lib/blogApi';
 *   const res = await blogFetch('/posts?per_page=12', { revalidate: 300 });
 */

const BLOG_API_BASE = "https://blog.mthokozisi.com/wp-json/wp/v2";
const BLOG_TOKEN    = process.env.BLOG_API_TOKEN ?? "";

if (!BLOG_TOKEN && process.env.NODE_ENV === "production") {
  console.warn(
    "[blogApi] BLOG_API_TOKEN is not set — all WP API requests will fail the auth gate."
  );
}

export interface BlogFetchOptions {
  /** Next.js ISR revalidation in seconds. Defaults to 300. */
  revalidate?: number;
}

export async function blogFetch(
  path: string,
  options: BlogFetchOptions = {}
): Promise<Response> {
  const url = `${BLOG_API_BASE}${path}`;

  return fetch(url, {
    headers: {
      "X-Blog-Token": BLOG_TOKEN,
    },
    next: { revalidate: options.revalidate ?? 300 },
  });
}
