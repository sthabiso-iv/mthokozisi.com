"use client";

/**
 * Experience
 * Vertical timeline stepper with a large focused role card.
 *
 * Desktop: left column (~260px) = spine with company/role nodes.
 *          right column = animated active role card.
 * Mobile:  horizontal dot stepper at top, card below.
 *
 * Navigation: click a timeline node, or use Prev/Next buttons,
 * or press left/right arrow keys.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { experience, type ExperienceEntry } from "@/data/portfolio";

// ── Group consecutive same-company entries ──────────────────────
interface CompanyGroup {
  company: string;
  url: string;
  firstIndex: number;
  indices: number[];
}

const GROUPS: CompanyGroup[] = experience.reduce<CompanyGroup[]>((acc, e, i) => {
  const last = acc[acc.length - 1];
  if (last?.company === e.company) {
    last.indices.push(i);
  } else {
    acc.push({ company: e.company, url: e.url, firstIndex: i, indices: [i] });
  }
  return acc;
}, []);

// ── Card animation variants ─────────────────────────────────────
const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } },
  exit:    { opacity: 0, y: 8,  transition: { duration: 0.15, ease: "easeIn" as const } },
};

// ── Sub-components ──────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block ml-1.5 mb-0.5 opacity-40"
      width="13" height="13"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function RoleCard({ entry }: { entry: ExperienceEntry }) {
  const hasLink = entry.url && entry.url !== "/";

  return (
    <div className="bg-[#111111] border border-[#1c1c1c] p-8 md:p-10">
      {/* Company name */}
      <div className="mb-1">
        {hasLink ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading font-bold text-[clamp(1.6rem,3vw,2.25rem)] uppercase tracking-wide text-[#f5c518] hover:text-[#ffd700] transition-colors duration-200 leading-none"
          >
            {entry.company}
            <ExternalLinkIcon />
          </a>
        ) : (
          <span className="font-heading font-bold text-[clamp(1.6rem,3vw,2.25rem)] uppercase tracking-wide text-[#f5c518] leading-none">
            {entry.company}
          </span>
        )}
      </div>

      {/* Role title */}
      <h3 className="font-heading font-bold text-xl uppercase tracking-wide text-[#f0f0f0] mt-2 mb-2">
        {entry.role}
      </h3>

      {/* Period + location */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
        <span className="font-body text-sm text-[#606060]">{entry.period}</span>
        <span className="w-1 h-1 rounded-full bg-[#333] flex-shrink-0" aria-hidden="true" />
        <span className="font-body text-sm text-[#606060]">{entry.location}</span>
      </div>

      {/* Yellow rule */}
      <span className="block w-10 h-[2px] bg-[#f5c518] mb-6" />

      {/* Bullet points */}
      <ul className="space-y-3 mb-8">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-[#f5c518]"
              aria-hidden="true"
            />
            <span className="text-[#a0a0a0] text-sm md:text-[0.9375rem] leading-relaxed font-body">
              {bullet}
            </span>
          </li>
        ))}
      </ul>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <span key={tag} className="pill text-[0.65rem]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function Experience() {
  const [active, setActive] = useState(0);
  const total               = experience.length;

  const prev = useCallback(
    () => setActive((i) => Math.max(i - 1, 0)),
    []
  );
  const next = useCallback(
    () => setActive((i) => Math.min(i + 1, total - 1)),
    [total]
  );

  // Arrow-key navigation (skip if focus is inside an input)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // ── State helpers ──────────────────────────────────────────────
  type NodeState = "active" | "past" | "future";

  function roleState(index: number): NodeState {
    if (index === active) return "active";
    if (index < active)   return "past";
    return "future";
  }

  function groupState(group: CompanyGroup): NodeState {
    if (group.indices.includes(active))             return "active";
    if (group.indices.every((i) => i < active))     return "past";
    return "future";
  }

  const opacityClass: Record<NodeState, string> = {
    active: "opacity-100",
    past:   "opacity-60",
    future: "opacity-30",
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <section id="experience" className="relative py-28 bg-[#0d0d0d]">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <p className="section-label mb-3">// 03 - Experience</p>
          <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)] mb-16">
            Work history
          </h2>
        </AnimatedSection>

        {/* ── Mobile: horizontal dot stepper ──────────────────── */}
        <div className="md:hidden flex items-center gap-3 mb-8 overflow-x-auto pb-1" role="tablist" aria-label="Navigate roles">
          {experience.map((e, i) => {
            const s = roleState(i);
            return (
              <button
                key={i}
                role="tab"
                aria-selected={s === "active"}
                aria-label={`${e.role} at ${e.company}`}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c518] ${
                  s === "active"
                    ? "w-3.5 h-3.5 bg-[#f5c518] ring-2 ring-[#f5c518]/30"
                    : s === "past"
                    ? "w-2.5 h-2.5 bg-[#3a3a3a]"
                    : "w-2 h-2 bg-[#222]"
                }`}
              />
            );
          })}
        </div>

        {/* ── Main grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0 md:gap-14 items-start">

          {/* ── Desktop: timeline spine ──────────────────────── */}
          <nav
            className="hidden md:block relative self-start sticky top-28"
            aria-label="Work experience timeline"
          >
            {/* Spine line */}
            <div
              className="absolute left-[19px] top-2 bottom-2 w-px bg-[#1c1c1c]"
              aria-hidden="true"
            />

            <div className="space-y-2">
              {GROUPS.map((group) => {
                const gs      = groupState(group);
                const isMulti = group.indices.length > 1;

                return (
                  <div key={group.company}>
                    {/* Company node */}
                    <button
                      onClick={() => setActive(group.firstIndex)}
                      aria-label={`Go to ${group.company}`}
                      className="flex items-start gap-4 w-full text-left group/node py-2 pr-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f5c518] rounded-sm"
                    >
                      {/* Dot */}
                      <div className="flex-shrink-0 flex items-center justify-center w-10 pt-[3px]">
                        {gs === "active" ? (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5c518] opacity-40" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f5c518]" />
                          </span>
                        ) : (
                          <span
                            className={`inline-flex rounded-full border transition-all duration-300 ${
                              gs === "past"
                                ? "w-2.5 h-2.5 bg-[#2e2e2e] border-[#3a3a3a]"
                                : "w-2 h-2 bg-[#1c1c1c] border-[#2a2a2a]"
                            }`}
                          />
                        )}
                      </div>

                      {/* Company label */}
                      <div className={`min-w-0 transition-opacity duration-200 ${opacityClass[gs]}`}>
                        <p className={`font-heading font-bold text-sm tracking-wide uppercase transition-colors duration-200 ${
                          gs === "active"
                            ? "text-[#f5c518]"
                            : "text-[#a0a0a0] group-hover/node:text-[#e0e0e0]"
                        }`}>
                          {group.company}
                        </p>
                        {!isMulti && (
                          <p className="text-[#505050] text-[11px] font-body mt-0.5 leading-tight">
                            {experience[group.firstIndex].period}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Sub-roles for multi-role companies */}
                    {isMulti && (
                      <div className="ml-10 pl-3 border-l border-[#1c1c1c] mt-0.5 mb-1 space-y-0.5">
                        {group.indices.map((ri) => {
                          const rs = roleState(ri);
                          return (
                            <button
                              key={ri}
                              onClick={() => setActive(ri)}
                              aria-label={experience[ri].role}
                              aria-current={rs === "active" ? "step" : undefined}
                              className="flex items-start gap-2.5 w-full text-left group/sub py-1.5 pr-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f5c518] rounded-sm"
                            >
                              {/* Sub-dot */}
                              <div className="flex-shrink-0 flex items-center justify-center w-3.5 pt-[5px]">
                                <span className={`inline-flex rounded-full transition-all duration-200 ${
                                  rs === "active"
                                    ? "w-2 h-2 bg-[#f5c518]"
                                    : rs === "past"
                                    ? "w-1.5 h-1.5 bg-[#333]"
                                    : "w-1 h-1 bg-[#242424]"
                                }`} />
                              </div>

                              <div className={`min-w-0 transition-opacity duration-200 ${opacityClass[rs]}`}>
                                <p className={`font-heading font-bold text-xs tracking-wide uppercase leading-tight transition-colors duration-200 ${
                                  rs === "active"
                                    ? "text-[#f5c518]"
                                    : "text-[#606060] group-hover/sub:text-[#a0a0a0]"
                                }`}>
                                  {experience[ri].role}
                                </p>
                                <p className="text-[#404040] text-[10px] font-body mt-0.5 leading-tight">
                                  {experience[ri].period}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* ── Role card + navigation ───────────────────────── */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <RoleCard entry={experience[active]} />
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next + counter */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={active === 0}
                aria-label="Previous role"
                className="inline-flex items-center gap-2 font-heading font-bold text-xs tracking-[0.12em] uppercase text-[#606060] hover:text-[#f5c518] disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Prev
              </button>

              <span className="font-heading text-xs text-[#333] tracking-[0.2em] tabular-nums select-none">
                {active + 1} / {total}
              </span>

              <button
                onClick={next}
                disabled={active === total - 1}
                aria-label="Next role"
                className="inline-flex items-center gap-2 font-heading font-bold text-xs tracking-[0.12em] uppercase text-[#606060] hover:text-[#f5c518] disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Keyboard hint (desktop) */}
            <p className="hidden md:block mt-3 text-[#2e2e2e] font-heading text-[10px] tracking-[0.15em] uppercase text-right select-none">
              Arrow keys to navigate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
