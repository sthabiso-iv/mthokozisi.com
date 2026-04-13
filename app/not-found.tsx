import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        {/* Decorative top bar */}
        <div className="h-[2px] w-24 bg-[#f5c518] mb-12" />

        <p className="font-heading font-700 text-[#f5c518] text-sm tracking-[0.2em] uppercase mb-4">
          // Error 404
        </p>

        <h1
          className="font-heading font-700 text-[clamp(5rem,20vw,10rem)] leading-none text-[#1c1c1c] select-none mb-8"
          aria-hidden="true"
        >
          404
        </h1>

        <h2 className="font-heading font-700 text-2xl uppercase tracking-wide text-[#f0f0f0] mb-4">
          Page not found
        </h2>

        <p className="text-[#606060] font-body text-base leading-relaxed mb-12">
          Whatever you were looking for isn&apos;t here. It may have moved,
          been deleted, or never existed in the first place.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c518] text-[#0d0d0d] font-heading font-700 text-xs tracking-[0.15em] uppercase hover:bg-[#ffd700] transition-colors duration-200"
          >
            Back home
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#242424] text-[#a0a0a0] font-heading font-700 text-xs tracking-[0.15em] uppercase hover:border-[#f5c518] hover:text-[#f5c518] transition-colors duration-200"
          >
            Browse posts
          </Link>
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 pt-8 border-t border-[#1c1c1c]">
          <p className="text-[#333] font-heading text-xs tracking-[0.15em] uppercase">
            mthokozisi.com
          </p>
        </div>
      </div>
    </main>
  );
}
