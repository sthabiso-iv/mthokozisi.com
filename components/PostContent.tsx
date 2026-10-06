"use client";

/**
 * components/PostContent.tsx
 * Client wrapper for rendered WordPress post HTML.
 * Accepts pre-processed HTML (featured image stripped + URLs proxied)
 * from the server component, attaches a ref, and mounts the lightbox.
 */

import { useRef, useEffect } from "react";
import { PostLightbox } from "@/components/PostLightbox";
import ShareButtons from "@/components/ShareButtons";

interface PostContentProps {
  html:     string;
  shortUrl: string;
  title:    string;
}

const PLAY_ICON  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const PAUSE_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function PostContent({ html, shortUrl, title }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>(".wp-block-audio")
    );
    if (!blocks.length) return;

    const cleanups: Array<() => void> = [];

    blocks.forEach((block) => {
      const audio = block.querySelector<HTMLAudioElement>("audio");
      if (!audio) return;

      // Disable native controls, download, and loop
      audio.removeAttribute("controls");
      audio.removeAttribute("loop");
      audio.loop = false;
      audio.setAttribute("controlsList", "nodownload noplaybackrate");
      audio.style.cssText = "display:none!important";

      // ── Derive a display label ─────────────────────────────────
      const caption = block.querySelector("figcaption");
      const label   = caption?.textContent?.trim() || "Audio";

      // ── Build player shell ────────────────────────────────────
      const player = document.createElement("div");
      player.className = "cap";

      // Top row: play btn + label + time
      const row = document.createElement("div");
      row.className = "cap-row";

      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "cap-btn";
      playBtn.setAttribute("aria-label", "Play");
      playBtn.innerHTML = PLAY_ICON;

      const labelEl = document.createElement("span");
      labelEl.className = "cap-label";
      labelEl.textContent = label;

      const timeEl = document.createElement("span");
      timeEl.className = "cap-time";
      timeEl.textContent = "0:00 / 0:00";

      row.append(playBtn, labelEl, timeEl);

      // Progress bar
      const bar   = document.createElement("div");
      bar.className = "cap-bar";
      bar.setAttribute("role", "slider");
      bar.setAttribute("aria-label", "Seek");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("aria-valuenow", "0");
      bar.setAttribute("tabindex", "0");

      const fill  = document.createElement("div");
      fill.className = "cap-fill";

      const thumb = document.createElement("div");
      thumb.className = "cap-thumb";

      bar.append(fill, thumb);
      player.append(row, bar);
      block.insertBefore(player, audio);

      // ── Helpers ───────────────────────────────────────────────
      const update = () => {
        const cur = audio.currentTime;
        const dur = isFinite(audio.duration) ? audio.duration : 0;
        const pct = dur ? (cur / dur) * 100 : 0;
        fill.style.width        = `${pct}%`;
        thumb.style.left        = `${pct}%`;
        timeEl.textContent      = `${fmtTime(cur)} / ${fmtTime(dur)}`;
        bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      };

      const setPlaying = (playing: boolean) => {
        playBtn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
        playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
        player.classList.toggle("cap--playing", playing);
      };

      // ── Seek on click ─────────────────────────────────────────
      const seek = (e: MouseEvent) => {
        const rect = bar.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (isFinite(audio.duration)) audio.currentTime = pct * audio.duration;
      };

      // Drag-to-seek
      let dragging = false;
      const onBarDown = (e: MouseEvent) => { dragging = true; seek(e); };
      const onMove    = (e: MouseEvent) => { if (dragging) seek(e); };
      const onUp      = ()               => { dragging = false; };

      // Keyboard seek on progress bar
      const onBarKey = (e: KeyboardEvent) => {
        if (!isFinite(audio.duration)) return;
        if (e.key === "ArrowRight") { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
        if (e.key === "ArrowLeft")  { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
      };

      const onPlay   = () => setPlaying(true);
      const onPause  = () => setPlaying(false);
      const onEnded  = () => { setPlaying(false); audio.currentTime = 0; update(); };

      const toggle = () => { audio.paused ? audio.play() : audio.pause(); };

      playBtn.addEventListener("click", toggle);
      audio.addEventListener("timeupdate",     update);
      audio.addEventListener("durationchange", update);
      audio.addEventListener("loadedmetadata", update);
      audio.addEventListener("play",  onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnded);
      bar.addEventListener("mousedown", onBarDown);
      bar.addEventListener("keydown",   onBarKey);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup",   onUp);

      cleanups.push(() => {
        playBtn.removeEventListener("click", toggle);
        audio.removeEventListener("timeupdate",     update);
        audio.removeEventListener("durationchange", update);
        audio.removeEventListener("loadedmetadata", update);
        audio.removeEventListener("play",  onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnded);
        bar.removeEventListener("mousedown", onBarDown);
        bar.removeEventListener("keydown",   onBarKey);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup",   onUp);
        player.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div className="post-share-bar">
        <span className="share-label">// Share</span>
        <ShareButtons shortUrl={shortUrl} title={title} />
      </div>

      <div
        ref={contentRef}
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PostLightbox contentRef={contentRef} />

      <div className="post-share-footer">
        <p>Found this useful? Share it.</p>
        <ShareButtons shortUrl={shortUrl} title={title} />
      </div>
    </>
  );
}
