"use client";

import { useState, useEffect } from "react";

interface ObfuscatedEmailProps {
  className?: string;
  linkClassName?: string;
}

// Email stored as char codes — never appears as a string literal in
// any HTML, RSC payload, or JS bundle that a scraper could pattern-match.
const CODES = [104,101,108,108,111,64,109,116,104,111,107,111,122,105,115,105,46,99,111,109];

export default function ObfuscatedEmail({ className, linkClassName }: ObfuscatedEmailProps) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(String.fromCharCode(...CODES));
  }, []);

  if (!email) {
    // Pre-hydration placeholder. No aria-label here: aria-label is not a
    // permitted attribute on a generic <span> with no role, and the element
    // is empty and instantly replaced once the email is decoded on mount.
    return <span className={className} />;
  }

  return (
    <a href={`mailto:${email}`} className={linkClassName ?? className}>
      {email}
    </a>
  );
}
