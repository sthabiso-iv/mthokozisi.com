"use client";

/**
 * components/PostLightbox.tsx
 * Premium image lightbox for blog post content.
 *
 * - Click any image inside .prose-content to open
 * - Expand-from-source animation via captured DOMRect
 * - Arrow key + swipe navigation between all post images
 * - Escape to close, click backdrop to close
 * - Body scroll lock while open
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxImage {
  src:     string;
  alt:     string;
  caption: string; // figcaption text sibling, if any
}

interface ActiveState {
  index:   number;
  srcRect: DOMRect;
  nav:     "open" | "prev" | "next"; // drives animation variant
}

interface PostLightboxProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSiblingCaption(img: HTMLImageElement): string {
  const figcaption =
    img.closest("figure")?.querySelector("figcaption") ??
    img.nextElementSibling;
  return figcaption instanceof HTMLElement ? figcaption.innerText.trim() : "";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PostLightbox({ contentRef }: PostLightboxProps) {
  const [images,  setImages]  = useState<LightboxImage[]>([]);
  const [active,  setActive]  = useState<ActiveState | null>(null);

  const touchStartX  = useRef<number | null>(null);
  const isOpen       = active !== null;
  const idx          = active?.index ?? 0;
  const current      = images[idx];

  // ── Collect images + attach click handlers ────────────────────────────────

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));

    setImages(
      imgs.map((img) => ({
        src:     img.src,
        alt:     img.alt || "",
        caption: getSiblingCaption(img),
      }))
    );

    const handlers: Array<() => void> = [];

    imgs.forEach((img, i) => {
      img.style.cursor = "zoom-in";
      const h = () => {
        const rect = img.getBoundingClientRect();
        setActive({ index: i, srcRect: rect, nav: "open" });
      };
      img.addEventListener("click", h);
      handlers.push(h);
    });

    return () => {
      imgs.forEach((img, i) => img.removeEventListener("click", handlers[i]));
    };
  }, [contentRef]);

  // ── Body scroll lock ──────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const close   = useCallback(() => setActive(null), []);

  const goNext  = useCallback(() => {
    setActive((a) =>
      a && a.index < images.length - 1
        ? { ...a, index: a.index + 1, nav: "next" }
        : a
    );
  }, [images.length]);

  const goPrev  = useCallback(() => {
    setActive((a) =>
      a && a.index > 0
        ? { ...a, index: a.index - 1, nav: "prev" }
        : a
    );
  }, []);

  const canNext = idx < images.length - 1;
  const canPrev = idx > 0;

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape")      close();
      if (e.key === "ArrowRight")  goNext();
      if (e.key === "ArrowLeft")   goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, goNext, goPrev]);

  // ── Touch swipe ───────────────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else           goPrev();
    }
  };

  // ── Image animation variants ──────────────────────────────────────────────
  //
  // "open"  — expands from the clicked image's position in the page
  // "next"  — slides in from the right
  // "prev"  — slides in from the left
  // closing — fades + scales down (exit is always a simple scale-out)

  const getImageVariants = (state: ActiveState) => {
    if (state.nav === "open") {
      const vw   = typeof window !== "undefined" ? window.innerWidth  : 1200;
      const vh   = typeof window !== "undefined" ? window.innerHeight : 800;
      const finalW = Math.min(vw * 0.9, 1080);
      const { left, top, width, height } = state.srcRect;

      const x     = left + width  / 2 - vw / 2;
      const y     = top  + height / 2 - vh * 0.45;
      const scale = width / finalW;

      return {
        initial:  { opacity: 0,   x,      y,     scale },
        animate:  { opacity: 1,   x: 0,   y: 0,  scale: 1 },
        exit:     { opacity: 0,   x: 0,   y: 0,  scale: 0.92 },
      };
    }

    const xDir = state.nav === "next" ? 60 : -60;
    return {
      initial:  { opacity: 0,   x: xDir, y: 0,  scale: 0.96 },
      animate:  { opacity: 1,   x: 0,    y: 0,  scale: 1    },
      exit:     { opacity: 0,   x: -xDir, y: 0, scale: 0.96 },
    };
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && active && current && (() => {
        const variants = getImageVariants(active);
        const caption  = current.caption || current.alt;

        return (
          <>
            {/* Backdrop */}
            <motion.div
              key="lb-backdrop"
              className="fixed inset-0 z-[300]"
              style={{ background: "rgba(0,0,0,0.92)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />

            {/* Shell — handles touch + keyboard target */}
            <motion.div
              key="lb-shell"
              className="fixed inset-0 z-[301] flex flex-col items-center justify-center select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* ── Close ── */}
              <button
                onClick={close}
                aria-label="Close lightbox"
                className="absolute top-5 right-5 z-10 p-2 text-white/50 hover:text-white transition-colors duration-150"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6"  x2="6"  y2="18" />
                  <line x1="6"  y1="6"  x2="18" y2="18" />
                </svg>
              </button>

              {/* ── Image (keyed so AnimatePresence re-runs on nav) ── */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={idx}
                  className="flex items-center justify-center"
                  style={{ maxWidth: "90vw", maxHeight: "85vh" }}
                  initial={variants.initial}
                  animate={variants.animate}
                  exit={variants.exit}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.src}
                    alt={current.alt}
                    draggable={false}
                    style={{
                      maxWidth:    "90vw",
                      maxHeight:   "78vh",
                      objectFit:   "contain",
                      display:     "block",
                      userSelect:  "none",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* ── Caption ── */}
              <AnimatePresence mode="wait">
                {caption && (
                  <motion.p
                    key={`caption-${idx}`}
                    className="mt-4 px-6 text-center text-white/40 text-[13px] italic max-w-lg leading-relaxed pointer-events-none"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    {caption}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── Counter ── */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/25 text-[11px] tracking-[0.2em] font-body pointer-events-none tabular-nums">
                  {idx + 1} / {images.length}
                </div>
              )}

              {/* ── Prev arrow ── */}
              {canPrev && (
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-[#f5c518]/40 hover:text-[#f5c518] transition-colors duration-150"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              {/* ── Next arrow ── */}
              {canNext && (
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-[#f5c518]/40 hover:text-[#f5c518] transition-colors duration-150"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>
  );
}
