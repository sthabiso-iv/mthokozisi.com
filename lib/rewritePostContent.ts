/**
 * lib/rewritePostContent.ts
 * - Rewrites all blog.mthokozisi.com image URLs to go through /api/image proxy
 * - Obfuscates email addresses as HTML entities to defeat scrapers
 */

import { encodeEmailHtml } from "@/lib/obfuscateEmail";

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export function rewritePostContent(html: string): string {
  // ── Step 1: Shield audio/video opening tags ───────────────────
  // The /api/image proxy buffers the full response with no range-request
  // support, which breaks audio/video streaming and seeking. Preserve those
  // src attributes so they point directly at the origin.
  const mediaTags: string[] = [];
  let result = html.replace(/<(audio|video)\b[^>]*>/gi, (match) => {
    const idx = mediaTags.push(match) - 1;
    return `\x00MEDIA${idx}\x00`;
  });

  // ── Step 2: Rewrite image src attributes ──────────────────────
  result = result.replace(
    /src="(https?:\/\/blog\.mthokozisi\.com[^"]*)"/gi,
    (_, url) => `src="/api/image?url=${encodeURIComponent(url)}"`
  );

  // ── Step 3: Rewrite srcset attributes ────────────────────────
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

  // ── Step 4: Rewrite href on WP-content linked images ─────────
  result = result.replace(
    /href="(https?:\/\/blog\.mthokozisi\.com\/wp-content[^"]*)"/gi,
    (_, url) => `href="/api/image?url=${encodeURIComponent(url)}"`
  );

  // ── Step 5: Restore audio/video tags ─────────────────────────
  result = result.replace(/\x00MEDIA(\d+)\x00/g, (_, idx) => mediaTags[Number(idx)]);

  // ── Step 6: Obfuscate mailto: href values ────────────────────
  result = result.replace(
    /href="mailto:([^"]+)"/gi,
    (_, email) => `href="mailto:${encodeEmailHtml(email)}"`
  );

  // ── Step 7: Obfuscate bare emails in text content ─────────────
  result = result.replace(/>([^<]+)</g, (_, text) => {
    const encoded = text.replace(EMAIL_RE, (email: string) => encodeEmailHtml(email));
    return `>${encoded}<`;
  });

  return result;
}
