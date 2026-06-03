/**
 * lib/rewritePostContent.ts
 * - Rewrites all blog.mthokozisi.com image URLs to go through /api/image proxy
 * - Obfuscates email addresses as HTML entities to defeat scrapers
 */

import { encodeEmailHtml } from "@/lib/obfuscateEmail";

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

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

  // Obfuscate mailto: href values
  result = result.replace(
    /href="mailto:([^"]+)"/gi,
    (_, email) => `href="mailto:${encodeEmailHtml(email)}"`
  );

  // Obfuscate bare emails only in text content (between tags), never inside attributes
  result = result.replace(/>([^<]+)</g, (_, text) => {
    const encoded = text.replace(EMAIL_RE, (email: string) => encodeEmailHtml(email));
    return `>${encoded}<`;
  });

  return result;
}
