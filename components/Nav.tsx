"use client";

/**
 * Nav
 * Fixed top navigation with smooth anchor links.
 * On the homepage: smooth-scrolls to the target section.
 * On other pages: navigates to /#section so the browser lands on the right spot.
 * Collapses to a hamburger menu on mobile.
 * Adds a dark background + border when the user scrolls down.
 */

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, meta } from "@/data/portfolio";
import { useCommandPalette } from "@/hooks/useCommandPalette";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: openPalette } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll position to style the nav bar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (pathname === "/") {
      // Already on homepage - smooth scroll
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    } else {
      // On another page - navigate to homepage then let the hash scroll
      router.push(`/${href}`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-[#242424]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo / Name */}
        <a
          href="/"
          className="font-heading font-bold text-lg tracking-[0.12em] uppercase text-[#f0f0f0] hover:text-[#f5c518] transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            if (pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push("/");
            }
          }}
        >
          {meta.nickname}
          <span className="text-[#f5c518]">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="font-heading font-600 text-sm tracking-[0.1em] uppercase text-[#a0a0a0] hover:text-[#f5c518] transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Search button */}
        <button
          onClick={openPalette}
          aria-label="Search (Cmd+K)"
          className="hidden md:flex items-center gap-2 text-[#606060] hover:text-[#f5c518] transition-colors duration-200 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-body font-500 text-[#444] border border-[#2a2a2a] group-hover:border-[#f5c518]/40 group-hover:text-[#f5c518] transition-all duration-200">
            ⌘K
          </span>
        </button>

        {/* Desktop CTA */}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#contact");
          }}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 border border-[#f5c518] text-[#f5c518] font-heading font-700 text-xs tracking-[0.15em] uppercase hover:bg-[#f5c518] hover:text-[#0d0d0d] transition-all duration-200"
        >
          Hire me
        </a>

        {/* Mobile right-side controls — grouped so justify-between doesn't spread them */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={openPalette}
            aria-label="Search"
            className="p-2 text-[#606060] hover:text-[#f5c518] transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-[5px] p-2 group"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
          <span
            className={`block w-6 h-[2px] bg-[#f0f0f0] transition-all duration-300 origin-center ${
              mobileOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#f0f0f0] transition-all duration-300 ${
              mobileOpen ? "opacity-0 w-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-[#f0f0f0] transition-all duration-300 origin-center ${
              mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
          </button>
        </div>{/* end mobile right-side controls */}
      </nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#111111] border-b border-[#242424]"
          >
            <ul className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="block py-3 font-heading font-600 text-base tracking-[0.1em] uppercase text-[#a0a0a0] hover:text-[#f5c518] transition-colors duration-200 border-b border-[#1c1c1c]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick("#contact");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-[#f5c518] text-[#f5c518] font-heading font-700 text-sm tracking-[0.15em] uppercase hover:bg-[#f5c518] hover:text-[#0d0d0d] transition-all duration-200"
                >
                  Hire me
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
