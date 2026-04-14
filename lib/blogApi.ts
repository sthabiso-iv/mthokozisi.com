/**
 * lib/blogApi.ts
 * Shared fetch utility for all WordPress REST API requests.
 */

const BLOG_API_BASE = "https://blog.mthokozisi.com/wp-json/wp/v2";

export async function blogFetch(
  path: string,
  options: { revalidate?: number } = {}
) {
  return fetch(`${BLOG_API_BASE}${path}`, {
    next: { revalidate: options.revalidate ?? 300 },
  });
}
