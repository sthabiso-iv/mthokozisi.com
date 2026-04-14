"use client";

/**
 * components/PostContent.tsx
 * Client wrapper for rendered WordPress post HTML.
 * Accepts pre-processed HTML (featured image stripped + URLs proxied)
 * from the server component, attaches a ref, and mounts the lightbox.
 */

import { useRef } from "react";
import { PostLightbox } from "@/components/PostLightbox";
import ShareButtons from "@/components/ShareButtons";

interface PostContentProps {
  html:     string;
  shortUrl: string;
  title:    string;
}

export function PostContent({ html, shortUrl, title }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="post-share-bar">
        <span className="share-label">// Share</span>
        <ShareButtons shortUrl={shortUrl} title={title} />
      </div>

      <div
        ref={contentRef}
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PostLightbox contentRef={contentRef} />

      <div className="post-share-footer">
        <p>Found this useful? Share it.</p>
        <ShareButtons shortUrl={shortUrl} title={title} />
      </div>
    </>
  );
}
