"use client";

/**
 * components/PostContent.tsx
 * Client wrapper for rendered WordPress post HTML.
 * Accepts pre-processed HTML (featured image stripped + URLs proxied)
 * from the server component, attaches a ref, and mounts the lightbox.
 */

import { useRef } from "react";
import { PostLightbox } from "@/components/PostLightbox";

interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={contentRef}
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PostLightbox contentRef={contentRef} />
    </>
  );
}
