"use client";

/**
 * app/error.tsx
 * Catches runtime errors thrown by any route segment below the root layout.
 * Must be a Client Component.
 */

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        {/* Decorative top bar */}
        <div className="h-[2px] w-24 bg-[#f5c518] mb-12" />

        <p className="font-heading font-700 text-[#f5c518] text-sm tracking-[0.2em] uppercase mb-4">
          // Something broke
        </p>

        <h1
          className="font-heading font-700 text-[clamp(5rem,20vw,10rem)] leading-none text-[#1c1c1c] select-none mb-8"
          aria-hidden="true"
        >
          500
        </h1>

        <h2 className="font-heading font-700 text-2xl uppercase tracking-wide text-[#f0f0f0] mb-4">
          Unexpected error
        </h2>

        <p className="text-[#606060] font-body text-base leading-relaxed mb-12">
          Something went wrong on my end. The error has been logged.
          Try refreshing, or come back shortly.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c518] text-[#0d0d0d] font-heading font-700 text-xs tracking-[0.15em] uppercase hover:bg-[#ffd700] transition-colors duration-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#242424] text-[#a0a0a0] font-heading font-700 text-xs tracking-[0.15em] uppercase hover:border-[#f5c518] hover:text-[#f5c518] transition-colors duration-200"
          >
            Back home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[#333] font-heading text-xs tracking-[0.1em] uppercase">
            Error ID: {error.digest}
          </p>
        )}

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
