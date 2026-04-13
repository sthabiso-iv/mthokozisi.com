/**
 * app/posts/page.tsx
 * Blog listing page - /posts
 * Accepts ?cat= query param to filter by category slug.
 * ISR: revalidates every hour.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getAllPosts,
  getPrimaryCategory,
  getFeaturedImageUrl,
  getPostUrl,
  stripHtml,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";
import { meta } from "@/data/portfolio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing | Mthokozisi Dhlamini",
  description:
    "Thoughts on building, infrastructure, edtech, and whatever else won't leave my head.",
  openGraph: {
    title: "Writing | Mthokozisi Dhlamini",
    description:
      "Thoughts on building, infrastructure, edtech, and whatever else won't leave my head.",
    url: `${meta.siteUrl}/posts`,
  },
  alternates: { canonical: `${meta.siteUrl}/posts` },
};

function PostCard({ post }: { post: WPPost }) {
  const category = getPrimaryCategory(post);
  const imageUrl = getFeaturedImageUrl(post);
  const excerpt = stripHtml(post.excerpt.rendered).slice(0, 160).trimEnd();
  const url = getPostUrl(post);

  return (
    <Link
      href={url}
      className="group relative flex flex-col bg-[#111111] border border-[#1c1c1c] hover:border-[#f5c518]/40 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f5c518] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />

      {imageUrl && (
        <div className="relative w-full aspect-[16/7] overflow-hidden bg-[#1c1c1c]">
          <Image
            src={imageUrl}
            alt={stripHtml(post.title.rendered)}
            fill
            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-500"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3">
          {category && (
            <span className="pill text-[0.65rem]">{category.name}</span>
          )}
          <span className="text-[#606060] text-xs font-body">{formatDate(post.date)}</span>
        </div>

        <h2
          className="font-heading font-700 text-lg uppercase tracking-wide text-[#f0f0f0] group-hover:text-[#f5c518] transition-colors duration-200 leading-snug mb-3"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {excerpt && (
          <p className="text-[#606060] text-sm leading-relaxed flex-1">
            {excerpt}{excerpt.length >= 160 ? "..." : ""}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2 font-heading font-600 text-xs tracking-[0.12em] uppercase text-[#f5c518] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Read
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;

  let allPosts: WPPost[] = [];
  let fetchError = false;

  try {
    allPosts = await getAllPosts(12);
  } catch {
    fetchError = true;
  }

  // Client-side category filter against already-fetched posts
  const posts = cat
    ? allPosts.filter((p) => getPrimaryCategory(p)?.slug === cat)
    : allPosts;

  // Unique categories for the filter bar
  const categories = Array.from(
    new Map(
      allPosts
        .map((p) => getPrimaryCategory(p))
        .filter(Boolean)
        .map((c) => [c!.slug, c!])
    ).values()
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="h-[72px]" />

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200 mb-8"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </Link>

          <p className="section-label mb-3">// Writing</p>
          <h1 className="section-heading text-[clamp(2.5rem,6vw,4.5rem)] mb-8">
            All posts
          </h1>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/posts"
                className={`pill text-[0.7rem] transition-colors duration-150 ${
                  !cat
                    ? "bg-[#f5c518]/20 border-[#f5c518]/60 text-[#f5c518]"
                    : "hover:bg-[#f5c518]/10"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/posts?cat=${c.slug}`}
                  className={`pill text-[0.7rem] transition-colors duration-150 ${
                    cat === c.slug
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

        {fetchError && (
          <div className="py-20 text-center">
            <p className="text-[#606060] font-body">
              Could not load posts right now.{" "}
              <a
                href="https://blog.mthokozisi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f5c518] underline underline-offset-4"
              >
                Visit the blog directly
              </a>
            </p>
          </div>
        )}

        {!fetchError && posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#606060] font-body">No posts found.</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c1c]">
            {posts.map((post) => (
              <div key={post.id} className="bg-[#0d0d0d]">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
