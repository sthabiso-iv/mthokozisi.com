/**
 * lib/wordpress.ts
 * WordPress REST API helpers — all requests go through blogFetch so the
 * X-Blog-Token auth header is always included.
 */

import { blogFetch } from "@/lib/blogApi";

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

// ── Content helpers ───────────────────────────────────────────

/**
 * Strip the featured image from post content.
 * Matches all WP size variants (e.g. -1024x576, -scaled) by extracting
 * the base filename stem from the URL.
 */
export function stripFeaturedImage(content: string, featuredImageUrl?: string): string {
  if (!featuredImageUrl || !content) return content;

  const pathNoQuery = featuredImageUrl.split("?")[0];
  const filename    = pathNoQuery.split("/").pop() ?? "";
  const stem        = filename
    .replace(/-\d+x\d+(\.[a-z]+)$/i, "$1")
    .replace(/\.[a-z]+$/i, "");

  let result = content;

  if (stem) {
    const escapedStem = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`<figure[^>]*>[\\s\\S]*?${escapedStem}[^<]*[\\s\\S]*?</figure>`, "gi"),
      ""
    );
    result = result.replace(
      new RegExp(`<img[^>]*${escapedStem}[^>]*>`, "gi"),
      ""
    );
  }

  const escapedUrl = featuredImageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  result = result
    .replace(new RegExp(`<img[^>]*src=["'][^"']*${escapedUrl}[^"']*["'][^>]*>`, "gi"), "")
    .replace(/<figure[^>]*>\s*<\/figure>/gi, "");

  return result;
}

/** Strip HTML tags and decode all HTML entities */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&#(\d+);/g,        (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex)  => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

// ── Term helpers ──────────────────────────────────────────────

function decodeTerm<T extends WPTerm>(term: T): T {
  return { ...term, name: stripHtml(term.name) };
}

export function getTags(post: WPPost): WPTerm[] {
  const terms = post._embedded?.["wp:term"] ?? [];
  return terms.flat().filter((t) => t.taxonomy === "post_tag").map(decodeTerm);
}

export function getPrimaryCategory(post: WPPost): WPTerm | null {
  const terms      = post._embedded?.["wp:term"] ?? [];
  const categories = terms.flat().filter((t) => t.taxonomy === "category").map(decodeTerm);
  return categories.find((c) => c.slug !== "uncategorized") ?? categories[0] ?? null;
}

// ── Media helpers ─────────────────────────────────────────────

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

// ── Text helpers ──────────────────────────────────────────────

export function getReadingTime(content: string): number {
  const words = stripHtml(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function getPostUrl(post: WPPost): string {
  const category = getPrimaryCategory(post);
  if (category) return `/${category.slug}/${post.slug}`;
  return `/posts/${post.slug}`;
}

// ── API fetchers ──────────────────────────────────────────────

/** Fetch all non-empty categories */
export async function getCategories(): Promise<WPTerm[]> {
  try {
    const res = await blogFetch("/categories?per_page=100&hide_empty=true", { revalidate: 300 });
    if (!res.ok) return [];
    const cats = (await res.json()) as WPTerm[];
    return cats
      .filter((c) => c.slug !== "uncategorized")
      .map((c) => ({ ...c, name: stripHtml(c.name) }));
  } catch {
    return [];
  }
}

/** Find a single category by slug — checks cache first, then hits API directly */
export async function getCategoryBySlug(slug: string): Promise<WPTerm | null> {
  const categories = await getCategories();
  const found      = categories.find((c) => c.slug === slug) ?? null;
  if (found) return found;

  try {
    const res = await blogFetch(
      `/categories?slug=${encodeURIComponent(slug)}&hide_empty=true`,
      { revalidate: 60 }
    );
    if (!res.ok) return null;
    const cats = (await res.json()) as WPTerm[];
    const cat  = cats[0] ?? null;
    return cat ? { ...cat, name: stripHtml(cat.name) } : null;
  } catch {
    return null;
  }
}

/** Paginated post fetch with optional category and search filtering */
export async function getPosts(options: {
  page?:       number;
  perPage?:    number;
  categoryId?: number;
  search?:     string;
  revalidate?: number;
}): Promise<PostsPage> {
  const { page = 1, perPage = 12, categoryId, search, revalidate = 300 } = options;

  const params = new URLSearchParams({
    _embed:   "1",
    per_page: String(perPage),
    page:     String(page),
    orderby:  "date",
    order:    "desc",
  });
  if (categoryId) params.set("categories", String(categoryId));
  if (search)     params.set("search",     search);

  const res = await blogFetch(`/posts?${params.toString()}`, { revalidate });

  if (!res.ok) {
    if (res.status === 400) return { posts: [], total: 0, totalPages: 0 };
    throw new Error(`WP API error: ${res.status}`);
  }

  const total      = parseInt(res.headers.get("X-WP-Total")      ?? "0", 10);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
  const posts      = (await res.json()) as WPPost[];

  return { posts, total, totalPages };
}

/** Fetch N most recent posts — short TTL for homepage freshness */
export async function getRecentPosts(count = 3): Promise<WPPost[]> {
  const { posts } = await getPosts({ page: 1, perPage: count, revalidate: 300 });
  return posts;
}

/** Fetch first page of posts for the listing page */
export async function getAllPosts(perPage = 12): Promise<WPPost[]> {
  const { posts } = await getPosts({ page: 1, perPage });
  return posts;
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await blogFetch(
    `/posts?slug=${encodeURIComponent(slug)}&_embed`,
    { revalidate: 300 }
  );
  if (!res.ok) return null;
  const posts = (await res.json()) as WPPost[];
  return posts[0] ?? null;
}

/** Fetch all post slugs for generateStaticParams */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const res = await blogFetch("/posts?per_page=100&_fields=slug", { revalidate: 300 });
    if (!res.ok) return [];
    const posts = (await res.json()) as Array<{ slug: string }>;
    return posts.map((p) => p.slug);
  } catch {
    return [];
  }
}
