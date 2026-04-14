/**
 * lib/blogApi.ts
 * Shared fetch utility for all WordPress REST API requests.
 */

const BLOG_API_BASE   = "https://blog.mthokozisi.com/wp-json/wp/v2";
const SHORT_LINKS_URL = "https://blog.mthokozisi.com/wp-json/mthokozisi/v1/short-links";

export async function blogFetch(
  path: string,
  options: { revalidate?: number } = {}
) {
  return fetch(`${BLOG_API_BASE}${path}`, {
    next: { revalidate: options.revalidate ?? 300 },
  });
}

/**
 * Fetch all short links and return a map of post_id → short slug.
 * Used to build mthokozisi.com/go/{slug} share URLs for each post.
 */
export async function getShortLinks(): Promise<Record<number, string>> {
  try {
    const res = await fetch(SHORT_LINKS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const links: { slug: string; post_id: number; url: string }[] = await res.json();
    return links.reduce<Record<number, string>>((acc, link) => {
      acc[link.post_id] = link.slug;
      return acc;
    }, {});
  } catch {
    return {};
  }
}
