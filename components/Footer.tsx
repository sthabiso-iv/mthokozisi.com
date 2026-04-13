/**
 * Footer
 * Clean, minimal. Name, year, and social links.
 */

import { meta, contact } from "@/data/portfolio";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0d0d0d] border-t border-[#1c1c1c]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: name + tagline */}
          <div>
            <p className="font-heading font-700 text-sm tracking-[0.15em] uppercase text-[#f0f0f0]">
              {meta.nickname}
              <span className="text-[#f5c518]">.</span>
            </p>
            <p className="text-[#606060] text-xs mt-1 font-body">
              {meta.title} · {meta.location}
            </p>
          </div>

          {/* Right: links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {contact.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading font-600 text-[11px] tracking-[0.15em] uppercase text-[#606060] hover:text-[#f5c518] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-8 pt-6 border-t border-[#1c1c1c]">
          <p className="text-[#444] text-xs font-body">
            © {year} Mthokozisi Dhlamini. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
