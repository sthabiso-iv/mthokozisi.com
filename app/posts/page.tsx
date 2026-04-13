/**
 * app/posts/page.tsx
 * Blog listing page — /posts
 * Shows all posts with infinite scroll via PostsGrid.
 * Category filtering now uses clean URLs: /posts/[category]
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/wordpress";
import PostsGrid from "@/components/PostsGrid";
import { meta } from "@/data/portfolio";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Writing",
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

export default async function PostsPage() {
  const [{ posts, total }, categories] = await Promise.all([
    getPosts({ page: 1, perPage: 12 }).catch(() => ({ posts: [], total: 0, totalPages: 1 })),
    getCategories().catch(() => []),
  ]);

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

          {/* Category filter — clean /posts/[category] URLs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/posts"
                className="pill text-[0.7rem] bg-[#f5c518]/20 border-[#f5c518]/60 text-[#f5c518]"
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/posts/${c.slug}`}
                  className="pill text-[0.7rem] hover:bg-[#f5c518]/10 transition-colors duration-150"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {posts.length === 0 ? (
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
        ) : (
          <PostsGrid initialPosts={posts} total={total} />
        )}
      </div>
    </div>
  );
}
