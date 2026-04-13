"use client";

/**
 * Skills
 * Grouped, scannable skill tags — not a wall of icons.
 * Groups sourced from data/portfolio.ts.
 */

import AnimatedSection from "@/components/AnimatedSection";
import { skillGroups } from "@/data/portfolio";

export default function Skills() {
  return (
    <section id="skills" className="relative py-28 bg-[#111111]">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <p className="section-label mb-3">// 04 - Skills</p>
          <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)] mb-16">
            What I work with
          </h2>
        </AnimatedSection>

        {/* Skill groups grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillGroups.map((group, groupIndex) => (
            <AnimatedSection key={group.label} delay={0.07 * groupIndex}>
              <div>
                {/* Group label */}
                <p className="font-heading font-700 text-xs tracking-[0.18em] uppercase text-[#f5c518] mb-4 pb-2 border-b border-[#1c1c1c]">
                  {group.label}
                </p>
                {/* Skill pills */}
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2.5 py-1 text-[0.68rem] font-body font-500 tracking-[0.04em] bg-[#161616] border border-[#242424] text-[#a0a0a0] hover:border-[#f5c518]/30 hover:text-[#f5c518] transition-colors duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
