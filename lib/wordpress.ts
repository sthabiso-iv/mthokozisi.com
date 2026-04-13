/**
 * lib/wordpress.ts
 * WordPress REST API helpers for blog.mthokozisi.com
 * All blog content is fetched from the WP subdomain and rendered
 * under mthokozisi.com — the subdomain is never exposed.
 */

const WP_API = "https://blog.mthokozisi.com/wp-json/wp/v2";

// ── Types ─────────────────────────────────────────────────────

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  count?: number;
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

export interface PostsPage {
  posts: WPPost[];
  total: number;
  totalPages: number;
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

/** Fetch all non-empty categories */
export async function getCategories(): Promise<WPTerm[]> {
  try {
    const res = await fetch(
      `${WP_API}/categories?per_page=100&hide_empty=true`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const cats = (await res.json()) as WPTerm[];
    return cats.filter((c) => c.slug !== "uncategorized");
  } catch {
    return [];
  }
}

/** Find a single category by slug, or null */
export async function getCategoryBySlug(slug: string): Promise<WPTerm | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

/**
 * Paginated post fetch — returns posts + pagination metadata.
 * When categoryId is provided, filters to that category only.
 */
export async function getPosts(options: {
  page?: number;
  perPage?: number;
  categoryId?: number;
}): Promise<PostsPage> {
  const { page = 1, perPage = 12, categoryId } = options;

  const params = new URLSearchParams({
    _embed: "1",
    per_page: String(perPage),
    page: String(page),
    orderby: "date",
    order: "desc",
  });
  if (categoryId) params.set("categories", String(categoryId));

  const res = await fetch(`${WP_API}/posts?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    // 400 means page is out of range — treat as empty last page
    if (res.status === 400) return { posts: [], total: 0, totalPages: 0 };
    throw new Error(`WP API error: ${res.status}`);
  }

  const total      = parseInt(res.headers.get("X-WP-Total")      ?? "0", 10);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
  const posts      = (await res.json()) as WPPost[];

  return { posts, total, totalPages };
}

/** Fetch N most recent posts (used for homepage preview) */
export async function getRecentPosts(count = 3): Promise<WPPost[]> {
  const { posts } = await getPosts({ page: 1, perPage: count });
  return posts;
}

/** Fetch all posts for the listing page (first page) */
export async function getAllPosts(perPage = 12): Promise<WPPost[]> {
  const { posts } = await getPosts({ page: 1, perPage });
  return posts;
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
    return [];
  }
}
