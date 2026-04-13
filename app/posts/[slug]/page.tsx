/**
 * app/posts/[slug]/page.tsx
 *
 * Handles two different cases for the /posts/[slug] URL:
 *
 * 1. CATEGORY  — /posts/wordpress
 *    If [slug] matches a WP category, renders a filtered post listing.
 *
 * 2. POST SLUG — /posts/some-post-title
 *    If [slug] matches a post slug, redirects to the canonical
 *    category-based URL: /{category}/{slug}
 */

import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getCategories,
  getPostBySlug,
  getAllPostSlugs,
  getPosts,
  getPrimaryCategory,
} from "@/lib/wordpress";
import PostsGrid from "@/components/PostsGrid";
import { meta } from "@/data/portfolio";

export const revalidate = 300;

// Pre-render known category slugs + post slugs at build time
export async function generateStaticParams() {
  const [slugs, categories] = await Promise.all([
    getAllPostSlugs(),
    getCategories(),
  ]);
  const all = [
    ...slugs.map((slug) => ({ slug })),
    ...categories.map((c) => ({ slug: c.slug })),
  ];
  // Deduplicate
  return Array.from(new Map(all.map((s) => [s.slug, s])).values());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (category) {
    return {
      title: `${category.name} Posts`,
      description: `All posts in the ${category.name} category.`,
      alternates: { canonical: `${meta.siteUrl}/posts/${slug}` },
    };
  }
  // Post slug — metadata not needed here (it redirects)
  return {};
}

export default async function PostsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── 1. Check if slug is a category ────────────────────────────
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (category) {
    const { posts, total } = await getPosts({
      page: 1,
      perPage: 12,
      categoryId: category.id,
    }).catch(() => ({ posts: [], total: 0, totalPages: 1 }));

    return (
      <div className="min-h-screen bg-[#0d0d0d]">
        <div className="h-[72px]" />

        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200 mb-8"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              All posts
            </Link>

            <p className="section-label mb-3">// {category.name}</p>
            <h1 className="section-heading text-[clamp(2.5rem,6vw,4.5rem)] mb-8">
              {category.name} posts
            </h1>

            {/* Category filter bar */}
            {allCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/posts"
                  className="pill text-[0.7rem] hover:bg-[#f5c518]/10 transition-colors duration-150"
                >
                  All
                </Link>
                {allCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/posts/${c.slug}`}
                    className={`pill text-[0.7rem] transition-colors duration-150 ${
                      c.slug === slug
                        ? "bg-[#f5c518]/20 border-[#f5c518]/60 text-[#f5c518]"
                        : "hover:bg-[#f5c518]/10"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#606060] font-body">No posts in this category yet.</p>
            </div>
          ) : (
            <PostsGrid initialPosts={posts} total={total} categorySlug={slug} />
          )}
        </div>
      </div>
    );
  }

  // ── 2. Try as post slug — redirect to canonical URL ───────────
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const postCategory = getPrimaryCategory(post);
  if (postCategory) {
    redirect(`/${postCategory.slug}/${post.slug}`);
  }

  // Fallback: post has no category — render inline
  const PostPage = (await import("@/components/PostPage")).default;
  return <PostPage post={post} />;
}
