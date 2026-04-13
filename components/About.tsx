"use client";

/**
 * About
 * Two-column layout: inline SVG avatar placeholder (left) + bio (right).
 * To add a real photo later, replace the <AvatarPlaceholder> with:
 *   <img src="/profile.jpg" alt="Mthokozisi Dhlamini" className="w-full h-full object-cover" />
 * and drop the file in /public/.
 */

import AnimatedSection from "@/components/AnimatedSection";
import { about } from "@/data/portfolio";

// ── Inline SVG avatar — no external image file needed ────────
function AvatarPlaceholder() {
  return (
    <svg
      viewBox="0 0 280 350"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Mthokozisi Dhlamini - profile photo coming soon"
      role="img"
    >
      {/* Dark background */}
      <rect width="280" height="350" fill="#1c1c1c" />

      {/* Subtle tactical grid */}
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="rgba(245,197,24,0.06)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="280" height="350" fill="url(#grid)" />

      {/* Shoulder / body silhouette */}
      <ellipse cx="140" cy="390" rx="110" ry="80" fill="#161616" />

      {/* Head circle */}
      <circle cx="140" cy="148" r="68" fill="#242424" />

      {/* Initials */}
      <text
        x="140"
        y="168"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Rajdhani', 'Barlow Condensed', sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="6"
        fill="#f5c518"
      >
        MD
      </text>

      {/* Subtle yellow ring */}
      <circle
        cx="140"
        cy="148"
        r="72"
        fill="none"
        stroke="rgba(245,197,24,0.15)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function About() {
  return (
    <section
      id="about"
      className="relative py-28 bg-[#111111]"
    >
      {/* Section divider at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section label */}
        <AnimatedSection>
          <p className="section-label mb-3">// 01 - About</p>
          <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)] mb-16">
            Who I am
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 lg:gap-20 items-start">
          {/* ── Left: Avatar ─────────────────────────────────── */}
          <AnimatedSection delay={0.1}>
            <div className="relative">
              {/* Yellow border frame — offset for depth */}
              <div className="absolute -top-3 -left-3 w-full h-full border border-[#f5c518] rounded-sm pointer-events-none" />
              <div className="relative w-full aspect-[4/5] bg-[#1c1c1c] rounded-sm overflow-hidden border border-[#242424]">
                <AvatarPlaceholder />
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right: Bio ────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Bio paragraphs */}
            <AnimatedSection delay={0.15}>
              <div className="space-y-5">
                {about.bio.map((para, i) => (
                  <p
                    key={i}
                    className="text-[#a0a0a0] leading-relaxed text-base md:text-[1.0625rem]"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* CV file should be placed at /public/cv/mthokozisi-dhlamini-cv.pdf */}
              <div className="mt-6">
                <a
                  href={about.cvPath}
                  download
                  className="inline-flex items-center gap-1.5 text-sm text-[#f5c518]/60 hover:text-[#f5c518] underline underline-offset-4 decoration-[#f5c518]/30 hover:decoration-[#f5c518] transition-colors duration-200 font-body"
                >
                  {/* Download arrow icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download CV
                </a>
              </div>
            </AnimatedSection>

            {/* Languages */}
            <AnimatedSection delay={0.25}>
              <div>
                <p className="section-label mb-3">Languages I speak</p>
                <div className="flex flex-wrap gap-2">
                  {about.languages.map((lang) => (
                    <span key={lang} className="pill">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Education */}
            <AnimatedSection delay={0.3}>
              <div className="flex items-start gap-4 p-5 bg-[#161616] border border-[#242424]">
                <span className="text-[#f5c518] mt-0.5">
                  {/* Graduation cap icon — inline SVG, no extra deps */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </span>
                <div>
                  <p className="font-heading font-700 text-[#f0f0f0] tracking-wide uppercase text-sm">
                    {about.education.degree}
                  </p>
                  <p className="text-[#a0a0a0] text-sm mt-0.5">
                    {about.education.institution} · {about.education.period}
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Quote */}
            <AnimatedSection delay={0.35}>
              <blockquote className="border-l-2 border-[#f5c518] pl-5">
                <p className="text-[#f0f0f0] italic text-base md:text-lg leading-relaxed">
                  &ldquo;{about.quote.text}&rdquo;
                </p>
                <cite className="block mt-2 text-[#606060] text-sm not-italic">
                  {about.quote.author}
                </cite>
              </blockquote>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
