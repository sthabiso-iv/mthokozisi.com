"use client";

/**
 * Contact
 * Form POSTs to /api/contact. Shows inline success state — no page reload.
 * Social links sourced from data/portfolio.ts.
 *
 * TODO: /api/contact currently accepts submissions but does not deliver email.
 * See app/api/contact/route.ts for the service integration TODO.
 */

import { useState, type FormEvent } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { contact } from "@/data/portfolio";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string; // honeypot - never shown to users
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch {
      setStatus("error");
    }
  };

  const field = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <section id="contact" className="relative py-28 bg-[#111111]">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1c1c1c]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <p className="section-label mb-3">// 05 - Contact</p>
          <h2 className="section-heading text-[clamp(2.5rem,6vw,4rem)] mb-4">
            Let&apos;s talk
          </h2>
          <p className="text-[#a0a0a0] text-lg font-body italic mb-16">
            {contact.tagline}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          {/* ── Left: Info ──────────────────────────────────── */}
          <AnimatedSection delay={0.1}>
            <div className="space-y-8">
              {/* Email */}
              <div>
                <p className="section-label mb-2">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-heading font-600 text-xl tracking-wide text-[#f0f0f0] hover:text-[#f5c518] transition-colors duration-200 break-all"
                >
                  {contact.email}
                </a>
              </div>

              {/* Social links */}
              <div>
                <p className="section-label mb-4">Find me</p>
                <ul className="space-y-3">
                  {contact.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 text-[#a0a0a0] hover:text-[#f5c518] transition-colors duration-200"
                      >
                        <span className="font-heading font-600 text-xs tracking-[0.15em] uppercase w-24 flex-shrink-0 text-[#606060] group-hover:text-[#f5c518] transition-colors duration-200">
                          {link.label}
                        </span>
                        <span className="h-px w-6 bg-[#333] group-hover:bg-[#f5c518] transition-colors duration-200 flex-shrink-0" />
                        <span className="font-body text-sm">{link.display}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right: Contact form ──────────────────────────── */}
          <AnimatedSection delay={0.2}>
            {status === "success" ? (
              /* Success state */
              <div className="flex flex-col items-start gap-4 py-12">
                <span className="text-[#f5c518] text-3xl" aria-hidden="true">✓</span>
                <p className="font-heading font-700 text-xl uppercase tracking-wide text-[#f0f0f0]">
                  Message sent.
                </p>
                <p className="text-[#a0a0a0] font-body">
                  I&apos;ll get back to you.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 text-sm text-[#606060] hover:text-[#f5c518] transition-colors duration-200 font-heading tracking-[0.1em] uppercase underline underline-offset-4"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot - hidden from humans, bots fill it, API rejects if non-empty */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                  <label htmlFor="c-website">Website</label>
                  <input
                    id="c-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={field("website")}
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="c-name" className="block font-heading font-600 text-xs tracking-[0.18em] uppercase text-[#606060] mb-2">
                    Name <span className="text-[#f5c518]">*</span>
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={field("name")}
                    placeholder="Your name"
                    className="w-full bg-[#161616] border border-[#242424] text-[#f0f0f0] placeholder-[#444] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#f5c518] transition-colors duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="c-email" className="block font-heading font-600 text-xs tracking-[0.18em] uppercase text-[#606060] mb-2">
                    Email <span className="text-[#f5c518]">*</span>
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={field("email")}
                    placeholder="you@example.com"
                    className="w-full bg-[#161616] border border-[#242424] text-[#f0f0f0] placeholder-[#444] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#f5c518] transition-colors duration-200"
                  />
                </div>

                {/* Subject (optional) */}
                <div>
                  <label htmlFor="c-subject" className="block font-heading font-600 text-xs tracking-[0.18em] uppercase text-[#606060] mb-2">
                    Subject <span className="text-[#444]">(optional)</span>
                  </label>
                  <input
                    id="c-subject"
                    type="text"
                    autoComplete="off"
                    value={form.subject}
                    onChange={field("subject")}
                    placeholder="What's this about?"
                    className="w-full bg-[#161616] border border-[#242424] text-[#f0f0f0] placeholder-[#444] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#f5c518] transition-colors duration-200"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="c-message" className="block font-heading font-600 text-xs tracking-[0.18em] uppercase text-[#606060] mb-2">
                    Message <span className="text-[#f5c518]">*</span>
                  </label>
                  <textarea
                    id="c-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={field("message")}
                    placeholder="What are you building?"
                    className="w-full bg-[#161616] border border-[#242424] text-[#f0f0f0] placeholder-[#444] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#f5c518] transition-colors duration-200 resize-none"
                  />
                </div>

                {/* Error message */}
                {status === "error" && (
                  <p className="text-red-400 text-sm font-body">
                    Something went wrong. Try emailing me directly at{" "}
                    <a href={`mailto:${contact.email}`} className="underline hover:text-[#f5c518]">
                      {contact.email}
                    </a>
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full md:w-auto px-8 py-3.5 bg-[#f5c518] text-[#0d0d0d] font-heading font-700 text-sm tracking-[0.15em] uppercase hover:bg-[#ffd700] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending…" : "Send it →"}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
