"use client";

/**
 * PostsGrid
 * Renders a grid of blog posts with infinite scroll.
 * Receives the first page from the server; fetches subsequent pages
 * from /api/posts when the sentinel element enters the viewport.
 *
 * Props:
 *   initialPosts  - server-rendered first page
 *   total         - total post count from WP API
 *   categorySlug  - optional: filter to a single category
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getPrimaryCategory,
  getFeaturedImageUrl,
  getPostUrl,
  stripHtml,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";

const PER_PAGE = 12;

function PostCard({ post }: { post: WPPost }) {
  const category = getPrimaryCategory(post);
  const imageUrl = getFeaturedImageUrl(post);
  const excerpt  = stripHtml(post.excerpt.rendered).slice(0, 160).trimEnd();
  const url      = getPostUrl(post);

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
            <span
              onClick={(e) => e.stopPropagation()}
              className="contents"
            >
              <Link
                href={`/posts/${category.slug}`}
                className="pill text-[0.65rem] hover:bg-[#f5c518]/20 hover:border-[#f5c518]/60 hover:text-[#f5c518] transition-colors duration-150"
              >
                {category.name}
              </Link>
            </span>
          )}
          <span className="text-[#606060] text-xs font-body">{formatDate(post.date)}</span>
        </div>

        <h2
          className="font-heading font-bold uppercase tracking-wide text-lg text-[#f0f0f0] group-hover:text-[#f5c518] transition-colors duration-200 leading-snug mb-3"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {excerpt && (
          <p className="text-[#606060] text-sm leading-relaxed flex-1">
            {excerpt}{excerpt.length >= 160 ? "..." : ""}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2 font-heading font-bold text-xs tracking-[0.12em] uppercase text-[#f5c518] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

interface PostsGridProps {
  initialPosts: WPPost[];
  total: number;
  categorySlug?: string;
}

export default function PostsGrid({ initialPosts, total, categorySlug }: PostsGridProps) {
  const [posts, setPosts]       = useState<WPPost[]>(initialPosts);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [hasMore, setHasMore]   = useState(initialPosts.length < total);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        per_page: String(PER_PAGE),
      });
      if (categorySlug) params.set("cat", categorySlug);

      const res  = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");

      const data = await res.json() as { posts: WPPost[]; total: number; totalPages: number };

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = data.posts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    } catch (err) {
      console.error("[PostsGrid] loadMore error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, categorySlug]);

  // Intersection observer — fires when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#606060] font-body">No posts found.</p>
      </div>
    );
  }

  // Limit columns to the total number of posts so the grid background
  // never bleeds through empty cells when there are fewer than 3 posts.
  const maxCols   = Math.min(total, 3);
  const colClass  =
    maxCols === 1
      ? "grid-cols-1"
      : maxCols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <div className={`grid ${colClass} gap-px bg-[#1c1c1c]`}>
        {posts.map((post) => (
          <div key={post.id} className="bg-[#0d0d0d]">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Sentinel + loader */}
      <div ref={sentinelRef} className="mt-12 flex justify-center" aria-live="polite">
        {loading && (
          <div className="flex items-center gap-3 text-[#606060] font-heading text-xs tracking-[0.15em] uppercase">
            <span className="w-4 h-4 border border-[#f5c518] border-t-transparent rounded-full animate-spin" />
            Loading
          </div>
        )}
        {!loading && !hasMore && posts.length > PER_PAGE && (
          <p className="text-[#333] font-heading text-xs tracking-[0.15em] uppercase">
            All {total} posts loaded
          </p>
        )}
      </div>
    </>
  );
}
