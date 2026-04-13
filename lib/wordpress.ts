/**
 * lib/wordpress.ts
 * WordPress REST API helpers for blog.mthokozisi.com
 * All blog content is fetched from the WP subdomain and rendered
 * under mthokozisi.com/posts/[slug] — the subdomain is never exposed.
 */

const WP_API = "https://blog.mthokozisi.com/wp-json/wp/v2";

// ── Types ─────────────────────────────────────────────────────

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPFeaturedMedia {
  source_url: string;
  alt_text: string;
  media_details?: {
    sizes?: {
      medium?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: WPFeaturedMedia[];
    "wp:term"?: WPTerm[][];
  };
}

// ── Helpers ───────────────────────────────────────────────────

/** Strip HTML tags and decode entities — safe for meta descriptions */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Get primary category from a post's embedded terms */
export function getPrimaryCategory(post: WPPost): WPTerm | null {
  const terms = post._embedded?.["wp:term"] ?? [];
  const categories = terms.flat().filter((t) => t.taxonomy === "category");
  return categories.find((c) => c.slug !== "uncategorized") ?? categories[0] ?? null;
}

/** Get featured image URL, preferring large size */
export function getFeaturedImageUrl(post: WPPost): string | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return (
    media.media_details?.sizes?.large?.source_url ??
    media.media_details?.sizes?.medium?.source_url ??
    media.source_url ??
    null
  );
}

/** Format a WP date string for display */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Canonical URL for a post.
 * Uses /{category.slug}/{post.slug} when a non-uncategorized category exists,
 * otherwise falls back to /posts/{post.slug}.
 */
export function getPostUrl(post: WPPost): string {
  const category = getPrimaryCategory(post);
  if (category) return `/${category.slug}/${post.slug}`;
  return `/posts/${post.slug}`;
}

// ── API fetchers ──────────────────────────────────────────────

/** Fetch N most recent posts (used for homepage preview) */
export async function getRecentPosts(count = 3): Promise<WPPost[]> {
  const res = await fetch(
    `${WP_API}/posts?_embed&per_page=${count}&orderby=date&order=desc`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json() as Promise<WPPost[]>;
}

/** Fetch all posts for the listing page */
export async function getAllPosts(perPage = 12): Promise<WPPost[]> {
  const res = await fetch(
    `${WP_API}/posts?_embed&per_page=${perPage}&orderby=date&order=desc`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json() as Promise<WPPost[]>;
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(
    `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const posts = (await res.json()) as WPPost[];
  return posts[0] ?? null;
}

/** Fetch all post slugs (used for generateStaticParams) */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${WP_API}/posts?per_page=100&fields=slug`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const posts = (await res.json()) as Array<{ slug: string }>;
    return posts.map((p) => p.slug);
  } catch {
    // Don't block the build if the API is unreachable
    return [];
  }
}
