/**
 * POST /api/contact
 *
 * Validates the form, checks honeypot, applies rate limiting,
 * then sends an email via Resend.
 *
 * Required env var:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *
 * Get a free API key at https://resend.com
 * Verify your domain (mthokozisi.com) in the Resend dashboard so the
 * "from" address resolves properly. Until then you can use
 * onboarding@resend.dev as the from address (only delivers to your
 * verified Resend account email).
 *
 * The "from" and "to" addresses are controlled by the constants below.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ── Config ────────────────────────────────────────────────────────────
const TO_EMAIL = "hello@mthokozisi.com";
// Once mthokozisi.com is verified in Resend, change this to:
//   "Portfolio <noreply@mthokozisi.com>"
const FROM_EMAIL = "onboarding@resend.dev";

// ── Rate limiting (in-memory, resets on cold start) ───────────────────
// Good enough for a portfolio form; swap for Redis/KV if you need persistence.
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;      // max submissions
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // per 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, subject, message, website } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string; // honeypot - must be empty
  };

  // ── Honeypot check (bots fill this, humans don't) ─────────────────
  if (website) {
    // Silently succeed so bots think it worked
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // ── Validation ────────────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Basic length caps to prevent abuse
  if (name.trim().length > 100 || message.trim().length > 5000) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  // ── Send email via Resend ─────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "Email service is not configured. Please contact me directly." },
      { status: 503 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailSubject = subject?.trim()
    ? `Portfolio: ${subject.trim()}`
    : `Portfolio contact from ${name.trim()}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: email.trim(),
    subject: emailSubject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h2 style="border-bottom:2px solid #f5c518;padding-bottom:8px">
          New message from mthokozisi.com
        </h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:8px 0;font-weight:bold;width:80px;color:#555">Name</td>
            <td style="padding:8px 0">${escapeHtml(name.trim())}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;color:#555">Email</td>
            <td style="padding:8px 0">
              <a href="mailto:${escapeHtml(email.trim())}" style="color:#f5c518">
                ${escapeHtml(email.trim())}
              </a>
            </td>
          </tr>
          ${subject?.trim() ? `
          <tr>
            <td style="padding:8px 0;font-weight:bold;color:#555">Subject</td>
            <td style="padding:8px 0">${escapeHtml(subject.trim())}</td>
          </tr>` : ""}
        </table>
        <div style="background:#f9f9f9;padding:16px;border-left:3px solid #f5c518;white-space:pre-wrap;line-height:1.6">
${escapeHtml(message.trim())}
        </div>
        <p style="margin-top:24px;font-size:12px;color:#999">
          Sent via mthokozisi.com contact form &middot; IP: ${ip}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email me directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
