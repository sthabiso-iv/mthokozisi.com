"use client";

/**
 * AnimatedSection
 * Wraps any section in a fade-up reveal on scroll.
 * Uses Framer Motion's whileInView — fires once, clean, no excess.
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts, in seconds */
  delay?: number;
  /** How far the element travels upward, in px */
  distance?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  distance = 32,
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay,
        // Typed as tuple so Framer Motion v12 accepts it as a cubic-bezier
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      }}
    >
      {children}
    </motion.div>
  );
}
