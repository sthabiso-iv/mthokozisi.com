"use client";

/**
 * CommandPalette
 * Keyboard-driven search modal. Triggered by Cmd+K / Ctrl+K (handled in
 * hooks/useCommandPalette.ts), the nav search icon, or Escape to close.
 *
 * Search sources:
 *  1. Local Fuse.js index  — projects, experience, skills (instant)
 *  2. WordPress REST API   — blog posts (debounced 300ms, query ≥ 3 chars,
 *                            only when local results < 5, 2s abort timeout)
 */

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js";

import { useCommandPalette } from "@/hooks/useCommandPalette";
import { projects, experience, skillGroups } from "@/data/portfolio";

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemType = "project" | "experience" | "skill" | "post";

interface SearchItem {
  type: ItemType;
  title: string;
  subtitle?: string;
  tags?: string[];
  url?: string;    // external http URL or internal /posts/… path
  anchor?: string; // e.g. "#projects" — smooth scroll on same page
}

// ── Local search index (module-level, built once) ────────────────────────────

const LOCAL_ITEMS: SearchItem[] = [
  // Projects
  ...projects.map<SearchItem>((p) => ({
    type: "project",
    title: p.name,
    subtitle: p.description.slice(0, 80).trimEnd() + (p.description.length > 80 ? "…" : ""),
    tags: p.tags,
    url: p.url.startsWith("http") ? p.url : undefined,
    anchor: "#projects",
  })),

  // Experience
  ...experience.map<SearchItem>((e) => ({
    type: "experience",
    title: e.role,
    subtitle: `${e.company} · ${e.period}`,
    tags: e.tags,
    anchor: "#experience",
  })),

  // Skills — one item per group with all skills as tags
  ...skillGroups.map<SearchItem>((g) => ({
    type: "skill",
    title: g.label,
    subtitle: g.skills.join(", "),
    tags: g.skills,
    anchor: "#skills",
  })),
];

// ── Fuse configuration ───────────────────────────────────────────────────────

const FUSE_OPTIONS = {
  keys: [
    { name: "title",    weight: 0.5 },
    { name: "subtitle", weight: 0.3 },
    { name: "tags",     weight: 0.2 },
  ],
  threshold: 0.3,
  includeMatches: true,
  minMatchCharLength: 2,
};

// ── HighlightedText ───────────────────────────────────────────────────────────

function HighlightedText({
  text,
  matches,
  matchKey,
}: {
  text: string;
  matches?: readonly FuseResultMatch[];
  matchKey: string;
}) {
  if (!matches) return <>{text}</>;

  const match = matches.find((m) => m.key === matchKey);
  if (!match || !match.indices.length) return <>{text}</>;

  const indices = [...match.indices].sort((a, b) => a[0] - b[0]);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const [start, end] of indices) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className="bg-transparent text-[#f5c518] font-600">
        {text.slice(start, end + 1)}
      </mark>
    );
    cursor = end + 1;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

// ── Category badge ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ItemType, string> = {
  project:    "PROJECT",
  experience: "EXPERIENCE",
  skill:      "SKILL",
  post:       "POST",
};

const TYPE_ORDER: ItemType[] = ["project", "experience", "skill", "post"];

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconProject() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconExperience() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function IconSkill() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconPost() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ItemIcon({ type }: { type: ItemType }) {
  switch (type) {
    case "project":    return <IconProject />;
    case "experience": return <IconExperience />;
    case "skill":      return <IconSkill />;
    case "post":       return <IconPost />;
  }
}

// ── WP post type (minimal fields returned by /api/posts) ─────────────────────

interface WPSearchPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:term"?: Array<Array<{ slug: string; taxonomy: string }>>;
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    // Named entities
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&lsquo;/g, "\u2018").replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C").replace(/&rdquo;/g, "\u201D")
    // Decimal numeric entities (e.g. &#8217; &#8220;)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    // Hex numeric entities (e.g. &#x2019;)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [postResults, setPostResults] = useState<SearchItem[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Stale-closure-safe refs
  const debounceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Fuse instance ──────────────────────────────────────────────────────────

  const fuse = useMemo(() => new Fuse(LOCAL_ITEMS, FUSE_OPTIONS), []);

  // ── Local results ──────────────────────────────────────────────────────────

  const localResults: FuseResult<SearchItem>[] = useMemo(() => {
    if (query.trim().length < 2) return [];
    return fuse.search(query.trim());
  }, [fuse, query]);

  // ── WP post search (debounced) ─────────────────────────────────────────────

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const q = query.trim();
    if (q.length < 3 || localResults.length >= 5) {
      setPostResults([]);
      setPostLoading(false);
      return;
    }

    setPostLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        // Route through our own API so the WP auth token stays server-side
        const res = await fetch(
          `/api/posts?search=${encodeURIComponent(q)}&per_page=5`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("Post search failed");

        const json = await res.json() as { posts: WPSearchPost[] };
        const data: WPSearchPost[] = json.posts ?? [];

        const items: SearchItem[] = data.map((p) => {
          // Derive canonical URL from category slug if embedded
          const cats   = p._embedded?.["wp:term"]?.flat().filter((t) => t.taxonomy === "category") ?? [];
          const catSlug = cats.find((c) => c.slug !== "uncategorized")?.slug ?? cats[0]?.slug;
          const url    = catSlug ? `/${catSlug}/${p.slug}` : `/posts/${p.slug}`;
          return {
            type: "post",
            title:    stripHtml(p.title.rendered),
            subtitle: stripHtml(p.excerpt.rendered).replace(/\[...\]/g, "").slice(0, 90).trimEnd() + "…",
            url,
          };
        });

        setPostResults(items);
      } catch {
        // Fail silently — network issues or abort
        setPostResults([]);
      } finally {
        setPostLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ── Combined flat display list ─────────────────────────────────────────────

  interface DisplayItem {
    item: SearchItem;
    matches?: readonly FuseResultMatch[];
    flatIndex: number;
    isFirstOfType: boolean;
  }

  const displayItems: DisplayItem[] = useMemo(() => {
    const grouped: Record<ItemType, DisplayItem[]> = {
      project: [], experience: [], skill: [], post: [],
    };

    for (const result of localResults) {
      grouped[result.item.type].push({
        item: result.item,
        matches: result.matches,
        flatIndex: 0,
        isFirstOfType: false,
      });
    }

    for (const post of postResults) {
      grouped.post.push({ item: post, matches: undefined, flatIndex: 0, isFirstOfType: false });
    }

    const flat: DisplayItem[] = [];
    for (const type of TYPE_ORDER) {
      const group = grouped[type];
      group.forEach((entry, i) => {
        flat.push({ ...entry, flatIndex: flat.length, isFirstOfType: i === 0 });
      });
    }

    return flat;
  }, [localResults, postResults]);

  // Keep activeIndex in bounds when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // ── Body scroll lock ───────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset state each time we open
      setQuery("");
      setPostResults([]);
      setPostLoading(false);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Navigation action ──────────────────────────────────────────────────────

  const navigate = useCallback((item: SearchItem) => {
    close();
    if (item.url) {
      if (item.url.startsWith("http")) {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.url);
      }
    } else if (item.anchor) {
      // Try smooth scroll; if not on homepage, navigate there first
      const target = document.querySelector(item.anchor);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/${item.anchor}`);
      }
    }
  }, [close, router]);

  // ── Keyboard handler ───────────────────────────────────────────────────────

  const flatRef = useRef<DisplayItem[]>([]);
  flatRef.current = displayItems;

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const flat = flatRef.current;

    if (e.key === "Escape") {
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter" && flat.length > 0) {
      e.preventDefault();
      const active = flat[activeIndex] ?? flat[0];
      if (active) navigate(active.item);
      return;
    }
  }, [activeIndex, close, navigate]);

  // ── Scroll active item into view ───────────────────────────────────────────

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Click outside to close ─────────────────────────────────────────────────

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  }, [close]);

  // ── Focus trap ─────────────────────────────────────────────────────────────

  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
  }, []);

  // ── Empty state text ───────────────────────────────────────────────────────

  const showEmpty = query.trim().length >= 2 && displayItems.length === 0 && !postLoading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
          aria-label="Command palette"
        >
          <motion.div
            key="palette-panel"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-[640px] bg-[#111111] overflow-hidden"
            style={{
              border: "1px solid rgba(245,197,24,0.2)",
              borderRadius: "12px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
            onKeyDown={handlePanelKeyDown}
          >
            {/* ── Input row ────────────────────────────────────────────── */}
            <div
              className="relative flex items-center px-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Search icon — stays muted at all times */}
              <svg
                width="18" height="18"
                viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0 pointer-events-none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, skills, experience, posts…"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-transparent border-0 outline-none ring-0 px-3 py-4 text-[18px] text-[#f0f0f0] placeholder-[#444] font-body focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
                style={{ caretColor: "#f5c518", boxShadow: "none" }}
                aria-label="Search"
                aria-autocomplete="list"
                aria-controls="palette-results"
                aria-activedescendant={displayItems.length > 0 ? `palette-item-${activeIndex}` : undefined}
              />

              {/* ESC hint + loading indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {postLoading && (
                  <span
                    className="block h-[2px] w-12 bg-[#1c1c1c] overflow-hidden rounded"
                    aria-label="Loading posts…"
                  >
                    <motion.span
                      className="block h-full bg-[#f5c518]"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                    />
                  </span>
                )}
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body text-[#444] border border-[#2a2a2a]">
                  ESC
                </kbd>
              </div>
            </div>

            {/* ── Results ──────────────────────────────────────────────── */}
            {(displayItems.length > 0 || showEmpty) && (
              <ul
                id="palette-results"
                ref={listRef}
                role="listbox"
                className="max-h-[420px] overflow-y-auto py-2"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#242424 transparent" }}
              >
                {showEmpty ? (
                  <li className="flex items-center justify-center py-12 text-[#444] font-body text-sm">
                    No results for &ldquo;{query.trim()}&rdquo;
                  </li>
                ) : (
                  displayItems.map((entry) => {
                    const isActive = entry.flatIndex === activeIndex;
                    return (
                      <li
                        key={`${entry.item.type}-${entry.item.title}`}
                        id={`palette-item-${entry.flatIndex}`}
                        data-index={entry.flatIndex}
                        role="option"
                        aria-selected={isActive}
                      >
                        {/* Group header */}
                        {entry.isFirstOfType && (
                          <div className="px-4 pt-3 pb-1">
                            <span className="font-heading font-700 text-[0.6rem] tracking-[0.2em] uppercase text-[#f5c518]">
                              {TYPE_LABELS[entry.item.type]}
                            </span>
                          </div>
                        )}

                        {/* Item row */}
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 focus:outline-none"
                          style={isActive ? {
                            background: "#1f1f1f",
                            borderLeft: "2px solid #f5c518",
                            paddingLeft: "calc(1rem - 2px)",
                          } : {
                            borderLeft: "2px solid transparent",
                          }}
                          onClick={() => navigate(entry.item)}
                          onMouseEnter={() => setActiveIndex(entry.flatIndex)}
                          tabIndex={-1}
                        >
                          {/* Icon */}
                          <span className={`flex-shrink-0 ${isActive ? "text-[#f5c518]" : "text-[#444]"}`}>
                            <ItemIcon type={entry.item.type} />
                          </span>

                          {/* Text */}
                          <span className="flex flex-col min-w-0">
                            <span className={`font-heading font-600 text-sm truncate transition-colors duration-100 ${isActive ? "text-[#f5c518]" : "text-[#d0d0d0]"}`}>
                              <HighlightedText
                                text={entry.item.title}
                                matches={entry.matches}
                                matchKey="title"
                              />
                            </span>
                            {entry.item.subtitle && (
                              <span className="font-body text-xs text-[#606060] truncate mt-0.5">
                                <HighlightedText
                                  text={entry.item.subtitle}
                                  matches={entry.matches}
                                  matchKey="subtitle"
                                />
                              </span>
                            )}
                          </span>

                          {/* External link indicator */}
                          {entry.item.url?.startsWith("http") && (
                            <svg
                              className="flex-shrink-0 ml-auto text-[#333]"
                              width="11" height="11"
                              viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}

            {/* ── Footer hint ───────────────────────────────────────────── */}
            {displayItems.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#1c1c1c]">
                <span className="flex items-center gap-1.5 text-[#333] text-[10px] font-body">
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[#2a2a2a] text-[9px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[#333] text-[10px] font-body">
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[#2a2a2a] text-[9px]">↵</kbd>
                  open
                </span>
                <span className="flex items-center gap-1.5 text-[#333] text-[10px] font-body">
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[#2a2a2a] text-[9px]">ESC</kbd>
                  close
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
