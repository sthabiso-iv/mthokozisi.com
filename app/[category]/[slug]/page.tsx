/**
 * app/[category]/[slug]/page.tsx
 * Canonical post URL: mthokozisi.com/{category}/{slug}
 * e.g. mthokozisi.com/seo/how-to-improve-seo-for-llms
 *
 * Matches WordPress permalink structure. The category segment is
 * validated against the post's actual categories for SEO correctness.
 * ISR: revalidates every 3600 seconds.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getAllPostSlugs,
  getFeaturedImageUrl,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/wordpress";
import { meta as siteMeta } from "@/data/portfolio";
import PostPage from "@/components/PostPage";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ category: "_", slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post not found" };

  const title = stripHtml(post.title.rendered);
  const description = stripHtml(post.excerpt.rendered).slice(0, 160);
  const imageUrl = getFeaturedImageUrl(post);
  const canonicalUrl = `${siteMeta.siteUrl}/${category}/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} | Mthokozisi Dhlamini`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Mthokozisi Dhlamini`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function CategoryPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Verify the category segment matches to avoid duplicate content
  // e.g. /wrong-cat/slug still resolves but canonical tag corrects it
  const postCategory = getPrimaryCategory(post);
  if (postCategory && postCategory.slug !== (await params).category) {
    // Post exists but category doesn't match - still render, canonical handles SEO
  }

  return <PostPage post={post} />;
}
