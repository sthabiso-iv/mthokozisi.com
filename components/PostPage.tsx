/**
 * components/PostPage.tsx
 * Shared post rendering layout used by:
 *   app/posts/[slug]/page.tsx
 *   app/[category]/[slug]/page.tsx
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPrimaryCategory,
  getTags,
  stripFeaturedImage,
  formatDate,
  stripHtml,
  type WPPost,
} from "@/lib/wordpress";
import ShareButtons from "@/components/ShareButtons";

interface PostPageProps {
  post: WPPost | null;
}

export default function PostPage({ post }: PostPageProps) {
  if (!post) notFound();

  const category   = getPrimaryCategory(post);
  const tags       = getTags(post);
  const plainTitle = stripHtml(post.title.rendered);

  // Strip any featured image WP may have injected into content.rendered
  const rawSourceUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const cleanContent = stripFeaturedImage(post.content.rendered, rawSourceUrl ?? undefined);

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
              <Link
                href={`/posts/${category.slug}`}
                className="pill hover:bg-[#f5c518]/20 hover:border-[#f5c518]/60 hover:text-[#f5c518] transition-colors duration-150"
              >
                {category.name}
              </Link>
            )}
            <span className="text-[#606060] text-xs font-body">{formatDate(post.date)}</span>
          </div>

          <h1
            className="font-heading font-bold text-[clamp(2rem,5vw,3.25rem)] uppercase leading-tight tracking-wide text-[#f0f0f0] mb-6"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Yellow rule */}
          <span className="block w-12 h-[3px] bg-[#f5c518]" />
        </header>

        {/* ── Post content ───────────────────────────────────── */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* ── Tags ───────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#1c1c1c]">
            <p className="section-label mb-3">// Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="pill text-[0.7rem] cursor-default"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Share buttons ───────────────────────────────────── */}
        <ShareButtons title={plainTitle} />

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="mt-12 pt-8 border-t border-[#1c1c1c] flex items-center justify-between gap-4">
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
