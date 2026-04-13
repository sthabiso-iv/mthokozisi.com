"use client";

/**
 * hooks/useCommandPalette.tsx
 *
 * Provides a React context for the command palette open/close state.
 * The global Cmd+K / Ctrl+K keyboard shortcut lives here so it works
 * from any page without re-registering the listener.
 *
 * Usage:
 *   1. Wrap your layout with <CommandPaletteProvider>
 *   2. Call useCommandPalette() in any component to get { isOpen, open, close }
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface CommandPaletteContextValue {
  isOpen: boolean;
  open:   () => void;
  close:  () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open  = useCallback(() => setIsOpen(true),  []);
  const close = useCallback(() => setIsOpen(false), []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return ctx;
}
