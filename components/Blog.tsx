/**
 * Blog
 * Server component. Fetches the 3 most recent posts from
 * blog.mthokozisi.com and renders them inline on the homepage.
 * Falls back gracefully to a placeholder if the fetch fails.
 *
 * Full post pages: app/[category]/[slug]/page.tsx
 */

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import {
  getRecentPosts,
  getPrimaryCategory,
  getPostUrl,
  stripHtml,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";

function PostCard({ post }: { post: WPPost }) {
  const category = getPrimaryCategory(post);
  const excerpt = stripHtml(post.excerpt.rendered).replace(/\[...\]/g, "").slice(0, 140).trimEnd();
  const url = getPostUrl(post);

  return (
    <div className="group relative flex flex-col bg-[#111111] border border-[#1c1c1c] hover:border-[#f5c518]/40 transition-all duration-300 p-6">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f5c518] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="flex items-center gap-3 mb-3">
        {category && (
          <Link
            href={`/posts?cat=${category.slug}`}
            className="pill text-[0.65rem] hover:bg-[#f5c518]/20 transition-colors duration-150"
          >
            {category.name}
          </Link>
        )}
        <span className="text-[#606060] text-xs font-body">{formatDate(post.date)}</span>
      </div>

      <h3
        className="font-heading font-700 text-base uppercase tracking-wide text-[#f0f0f0] group-hover:text-[#f5c518] transition-colors duration-200 leading-snug mb-2"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      {excerpt && (
        <p className="text-[#606060] text-sm leading-relaxed flex-1 mb-5">
          {excerpt}{excerpt.length >= 140 ? "..." : ""}
        </p>
      )}

      <Link
        href={url}
        className="inline-flex items-center gap-2 font-heading font-600 text-xs tracking-[0.12em] uppercase text-[#f5c518] hover:text-[#ffd700] transition-colors duration-200 mt-auto"
      >
        Read
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}

function BlogPlaceholder() {
  return (
    <>
      <p className="text-[#606060] text-base max-w-xl leading-relaxed mt-4">
        Coming soon - thoughts on building, infrastructure, edtech, and
        whatever else won&apos;t leave my head.
      </p>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c1c]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#0d0d0d] p-6">
            <div className="space-y-3">
              <div className="h-3 w-20 bg-[#1c1c1c] rounded" />
              <div className="h-5 w-4/5 bg-[#1c1c1c] rounded" />
              <div className="h-4 w-full bg-[#161616] rounded" />
              <div className="h-4 w-3/4 bg-[#161616] rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default async function Blog() {
  let posts: WPPost[] = [];
  try {
    posts = await getRecentPosts(3);
  } catch {
    // API unreachable - show placeholder
  }

  return (
    <section id="blog" className="relative py-28 bg-[#0d0d0d]">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          <p className="section-label mb-3">// 05 - Writing</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)]">
              Writing
            </h2>
            {posts.length > 0 && (
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 font-heading font-600 text-sm tracking-[0.12em] uppercase text-[#a0a0a0] hover:text-[#f5c518] transition-colors duration-200"
              >
                All posts
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}
          </div>
        </AnimatedSection>

        {posts.length > 0 ? (
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c1c]">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#0d0d0d]">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection delay={0.1}>
            <BlogPlaceholder />
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
