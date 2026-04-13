/**
 * components/PostPage.tsx
 * Shared post rendering layout used by:
 *   app/posts/[slug]/page.tsx
 *   app/[category]/[slug]/page.tsx
 *
 * Both routes fetch the post differently but render identically.
 * The blog.mthokozisi.com subdomain is never surfaced to the visitor.
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPrimaryCategory,
  getFeaturedImageUrl,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";

interface PostPageProps {
  post: WPPost | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post) notFound();

  const category = getPrimaryCategory(post);
  const imageUrl = getFeaturedImageUrl(post);
  const featuredAlt = post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ?? post.title.rendered;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Nav spacer */}
      <div className="h-[72px]" />

      <article className="max-w-3xl mx-auto px-6 py-20">
        {/* ── Back link ──────────────────────────────────────── */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200 mb-12"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          All posts
        </Link>

        {/* ── Meta ───────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            {category && (
              <span className="pill">{category.name}</span>
            )}
            <span className="text-[#606060] text-xs font-body">{formatDate(post.date)}</span>
          </div>

          <h1
            className="font-heading font-700 text-[clamp(2rem,5vw,3.25rem)] uppercase leading-tight tracking-wide text-[#f0f0f0] mb-6"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Yellow rule */}
          <span className="block w-12 h-[3px] bg-[#f5c518]" />
        </header>

        {/* ── Featured image ─────────────────────────────────── */}
        {imageUrl && (
          <div className="relative w-full aspect-[16/9] mb-12 overflow-hidden border border-[#242424]">
            <Image
              src={imageUrl}
              alt={featuredAlt}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* ── Post content ───────────────────────────────────── */}
        <div
          className="wp-content"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="mt-16 pt-8 border-t border-[#1c1c1c] flex items-center justify-between gap-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All posts
          </Link>
          <Link
            href="/#contact"
            className="font-heading text-xs tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200"
          >
            Get in touch
          </Link>
        </footer>
      </article>
    </div>
  );
}
