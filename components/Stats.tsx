"use client";

/**
 * Stats
 * Bold row of 4 numbers. High contrast, tactical styling.
 * Pulls from data/portfolio.ts — add/remove stats there.
 */

import AnimatedSection from "@/components/AnimatedSection";
import { stats } from "@/data/portfolio";

export default function Stats() {
  return (
    <section
      id="stats"
      className="relative py-20 bg-[#0d0d0d] overflow-hidden"
    >
      {/* Faint horizontal rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      {/* Tactical grid bg — subtle in this section */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 197, 24, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 197, 24, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c1c1c]">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={0.1 * i}>
              <div className="bg-[#0d0d0d] px-8 py-10 flex flex-col items-start gap-2">
                {/* Big number */}
                <span className="font-heading font-700 text-[clamp(2.75rem,6vw,4.5rem)] leading-none text-[#f5c518] tracking-tight">
                  {stat.value}
                </span>
                {/* Label */}
                <span className="font-heading font-600 text-xs tracking-[0.15em] uppercase text-[#f0f0f0]">
                  {stat.label}
                </span>
                {/* Sub-label */}
                {stat.sub && (
                  <span className="font-body text-[0.7rem] text-[#606060] tracking-wide">
                    {stat.sub}
                  </span>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
