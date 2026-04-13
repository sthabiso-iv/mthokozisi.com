"use client";

/**
 * Projects
 * Card grid of all projects pulled from data/portfolio.ts.
 * Each card shows: name, description, tech tags, and an external link.
 */

import AnimatedSection from "@/components/AnimatedSection";
import { projects, type Project } from "@/data/portfolio";

// ── External link icon ────────────────────────────────────────
function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ── Individual project card ───────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isPlaceholder = project.url === "#";

  return (
    <AnimatedSection delay={0.05 * index} className="h-full">
      <div className="group relative h-full flex flex-col bg-[#111111] border border-[#1c1c1c] hover:border-[#f5c518]/40 transition-all duration-300 p-6">
        {/* Top accent line — reveals on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f5c518] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

        {/* Project name + link */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-heading font-700 text-lg uppercase tracking-wide text-[#f0f0f0] group-hover:text-[#f5c518] transition-colors duration-200">
            {project.name}
          </h3>
          {!isPlaceholder && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mt-1 text-[#606060] hover:text-[#f5c518] transition-colors duration-200"
              aria-label={`Visit ${project.name}`}
            >
              <ExternalLinkIcon />
            </a>
          )}
        </div>

        {/* Highlight badge */}
        {project.highlight && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f5c518]/10 border border-[#f5c518]/25 w-fit">
            <span className="w-1 h-1 bg-[#f5c518] rounded-full" />
            <span className="font-heading font-600 text-xs tracking-[0.08em] uppercase text-[#f5c518]">
              {project.highlight}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-[#a0a0a0] text-sm leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="pill">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

// ── Section ───────────────────────────────────────────────────
export default function Projects() {
  return (
    <section id="projects" className="relative py-28 bg-[#0d0d0d]">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <p className="section-label mb-3">// 02 - Work</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)]">
              What I&apos;ve built
            </h2>
            <p className="text-[#606060] text-sm max-w-xs leading-relaxed font-body">
              Some of what I&apos;ve shipped. Each one taught me something I couldn&apos;t get from a course.
            </p>
          </div>
        </AnimatedSection>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c1c]">
          {projects.map((project, i) => (
            <div key={project.name} className="bg-[#0d0d0d]">
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
