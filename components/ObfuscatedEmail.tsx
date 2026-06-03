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
    return <span className={className} aria-label="Email address" />;
  }

  return (
    <a href={`mailto:${email}`} className={linkClassName ?? className}>
      {email}
    </a>
  );
}
