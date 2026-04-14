/**
 * lib/rewritePostContent.ts
 * Rewrites all blog.mthokozisi.com image URLs in rendered WP HTML to go
 * through the /api/image proxy, so the origin is never visible to visitors.
 */

const BLOG_ORIGIN_RE = /https?:\/\/blog\.mthokozisi\.com/gi;

export function rewritePostContent(html: string): string {
  // Rewrite src="https://blog.mthokozisi.com/..."
  let result = html.replace(
    /src="(https?:\/\/blog\.mthokozisi\.com[^"]*)"/gi,
    (_, url) => `src="/api/image?url=${encodeURIComponent(url)}"`
  );

  // Rewrite srcset="url1 1x, url2 2x, ..."
  result = result.replace(
    /srcset="([^"]*)"/gi,
    (_, srcset: string) => {
      const rewritten = srcset.replace(
        /(https?:\/\/blog\.mthokozisi\.com[^\s,]+)/gi,
        (url: string) => `/api/image?url=${encodeURIComponent(url)}`
      );
      return `srcset="${rewritten}"`;
    }
  );

  // Rewrite href on linked images (e.g. gallery lightbox links WP sometimes adds)
  result = result.replace(
    /href="(https?:\/\/blog\.mthokozisi\.com\/wp-content[^"]*)"/gi,
    (_, url) => `href="/api/image?url=${encodeURIComponent(url)}"`
  );

  return result;
}
