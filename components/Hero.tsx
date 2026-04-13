"use client";

/**
 * Hero
 * Full-viewport opening section.
 * Tactical grid background + animated particles (CSS-only, lightweight).
 * Name, subtitle, tagline, and two CTA buttons.
 */

import { motion } from "framer-motion";
import { hero } from "@/data/portfolio";

// ── Fade-up variants ──────────────────────────────────────────
// ease must be typed as a 4-element tuple for Framer Motion's cubic-bezier
const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export default function Hero() {
  const scrollTo = (href: string) => {
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0d]"
    >
      {/* ── Tactical grid background ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 197, 24, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 197, 24, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Radial vignette — pulls focus to centre ──────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, #0d0d0d 100%)",
        }}
      />

      {/* ── Animated accent orb — subtle, not tacky ─────────── */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-[72px] text-left md:text-left">
        {/* Status badge */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#161616] border border-[#242424] text-[#a0a0a0] text-xs font-body tracking-[0.08em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] animate-pulse" />
            Available for select projects
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-heading font-700 uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(3.5rem,10vw,8rem)] text-[#f0f0f0] mb-2"
        >
          Mthokozisi
          <br />
          <span className="text-[#f5c518]">Dhlamini</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.35)}
          className="mt-6 font-heading font-500 text-[clamp(1rem,2.5vw,1.5rem)] tracking-[0.12em] uppercase text-[#a0a0a0]"
        >
          {hero.subtitle}
        </motion.p>

        {/* Yellow divider */}
        <motion.span
          {...fadeUp(0.45)}
          className="block w-12 h-[3px] bg-[#f5c518] my-6"
        />

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.5)}
          className="max-w-xl text-[#a0a0a0] text-base md:text-lg leading-relaxed font-body"
        >
          {hero.tagline}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          {...fadeUp(0.65)}
          className="mt-10 flex flex-wrap gap-4"
        >
          <button
            onClick={() => scrollTo(hero.cta.primary.href)}
            className="px-7 py-3.5 bg-[#f5c518] text-[#0d0d0d] font-heading font-700 text-sm tracking-[0.15em] uppercase hover:bg-[#ffd700] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
          >
            {hero.cta.primary.label}
          </button>
          <button
            onClick={() => scrollTo(hero.cta.secondary.href)}
            className="px-7 py-3.5 border border-[#f5c518] text-[#f5c518] font-heading font-700 text-sm tracking-[0.15em] uppercase hover:bg-[#f5c518] hover:text-[#0d0d0d] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
          >
            {hero.cta.secondary.label}
          </button>
        </motion.div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-[#606060]">
          Scroll
        </span>
        <motion.div
          className="w-[1px] h-10 bg-[#f5c518] origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </motion.div>
    </section>
  );
}
