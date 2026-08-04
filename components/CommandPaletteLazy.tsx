"use client";

/**
 * CommandPaletteLazy
 * Defers the CommandPalette bundle (framer-motion + fuse.js + the palette
 * itself) out of the initial page load. The palette is only a Cmd+K / search
 * modal, so its code is fetched the first time it is opened rather than on
 * every page view. This keeps that JavaScript off the critical path.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCommandPalette } from "@/hooks/useCommandPalette";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
});

export default function CommandPaletteLazy() {
  const { isOpen } = useCommandPalette();
  const [mounted, setMounted] = useState(false);

  // Mount (and thus download) the palette the first time it opens, then keep
  // it mounted so subsequent opens and the close animation are instant.
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  return mounted ? <CommandPalette /> : null;
}
