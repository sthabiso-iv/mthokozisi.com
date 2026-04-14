/**
 * app/[category]/[slug]/page.tsx
 * Canonical post URL: mthokozisi.com/{category}/{slug}
 * Matches the WordPress /%category%/%postname%/ permalink structure.
 *
 * - dynamicParams = true  →  posts not in generateStaticParams render on demand
 * - generateStaticParams  →  builds { category, slug } pairs for all known posts
 * - The category segment is ignored for the API lookup (WP finds by slug alone);
 *   it is only used for the canonical URL in metadata.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getFeaturedImageUrl,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/wordpress";
import { blogFetch, getShortLinks } from "@/lib/blogApi";
import { meta as siteMeta } from "@/data/portfolio";
import PostPage from "@/components/PostPage";

export const revalidate    = 300;
export const dynamicParams = true;

// ── Static params ─────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const res = await blogFetch(
      "/posts?per_page=100&_fields=slug,_links&_embed",
      { revalidate: 300 }
    );
    if (!res.ok) return [];

    const posts = (await res.json()) as Array<{
      slug: string;
      _embedded?: { "wp:term"?: Array<Array<{ slug: string; taxonomy: string }>> };
    }>;

    if (!Array.isArray(posts)) return [];

    return posts.map((post) => {
      const cats     = post._embedded?.["wp:term"]?.flat()
        .filter((t) => t.taxonomy === "category") ?? [];
      const category = cats.find((c) => c.slug !== "uncategorized")?.slug
        ?? cats[0]?.slug
        ?? "uncategorised";
      return { category, slug: post.slug };
    });
  } catch {
    return [];
  }
}

// ── Metadata ──────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const [post, shortLinks] = await Promise.all([getPostBySlug(slug), getShortLinks()]);

  if (!post) return { title: "Post not found" };

  const title        = stripHtml(post.title.rendered);
  const description  = stripHtml(post.excerpt.rendered).slice(0, 160);
  const imageUrl     = getFeaturedImageUrl(post);
  const canonicalUrl = `${siteMeta.siteUrl}/${category}/${post.slug}`;
  const shortSlug    = shortLinks[post.id];
  const shareUrl     = shortSlug ? `${siteMeta.siteUrl}/go/${shortSlug}` : canonicalUrl;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title:         `${title} | Mthokozisi Dhlamini`,
      description,
      url:           shareUrl,
      type:          "article",
      publishedTime: post.date,
      modifiedTime:  post.modified,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${title} | Mthokozisi Dhlamini`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function CategoryPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug, category } = await params;
  const [post, shortLinks] = await Promise.all([getPostBySlug(slug), getShortLinks()]);

  if (!post) notFound();

  const shortSlug = shortLinks[post.id];
  const shortUrl  = shortSlug
    ? `${siteMeta.siteUrl}/go/${shortSlug}`
    : `${siteMeta.siteUrl}/${category}/${post.slug}`;

  // The category segment is used for canonical SEO only — rendering always
  // uses the actual post data regardless of what category was in the URL.
  return <PostPage post={post} shortUrl={shortUrl} />;
}
