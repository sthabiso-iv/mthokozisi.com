/**
 * POST /api/contact
 *
 * On success sends two emails via Resend:
 *   1. Notification to you with the full message (reply-to set to sender)
 *   2. Confirmation to the sender with their message quoted back
 *
 * Required env vars  (set in .env.local and in Vercel project settings):
 *   RESEND_API_KEY    - API key from resend.com
 *   EMAIL_FROM        - verified sender address, e.g. noreply@mthokozisi.com
 *   EMAIL_FROM_NAME   - display name, e.g. Mthokozisi Dhlamini
 *   EMAIL_TO          - your inbox, e.g. hello@mthokozisi.com
 *
 * Domain verification in Resend is required for a custom from address.
 * Until then you can set EMAIL_FROM=onboarding@resend.dev (only delivers
 * to the email address registered with your Resend account).
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ── Config (driven entirely by env vars) ─────────────────────────────
function getConfig() {
  const apiKey   = process.env.RESEND_API_KEY;
  const fromAddr = process.env.EMAIL_FROM      || "onboarding@resend.dev";
  const fromName = process.env.EMAIL_FROM_NAME || "Mthokozisi Dhlamini";
  const toEmail  = process.env.EMAIL_TO        || "hello@mthokozisi.com";
  const from     = `${fromName} <${fromAddr}>`;
  return { apiKey, from, toEmail };
}

// ── Rate limiting (in-memory; resets on cold start) ───────────────────
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX    = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
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
    website?: string;
  };

  // Honeypot
  if (website) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (name.trim().length > 100 || message.trim().length > 5000) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  const { apiKey, from, toEmail } = getConfig();

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "Email service is not configured. Please contact me directly." },
      { status: 503 }
    );
  }

  const resend        = new Resend(apiKey);
  const safeName      = escapeHtml(name.trim());
  const safeEmail     = escapeHtml(email.trim());
  const safeSubject   = subject?.trim() ? escapeHtml(subject.trim()) : "";
  const safeMessage   = escapeHtml(message.trim());
  const notifSubject  = safeSubject
    ? `Portfolio: ${safeSubject}`
    : `Portfolio contact from ${safeName}`;

  // Send both emails concurrently
  const [notif, confirm] = await Promise.all([
    // 1. Notification to you
    resend.emails.send({
      from,
      to:      toEmail,
      replyTo: email.trim(),
      subject: notifSubject,
      html:    buildNotificationEmail({ name: safeName, email: safeEmail, subject: safeSubject, message: safeMessage, ip }),
    }),
    // 2. Confirmation to sender
    resend.emails.send({
      from,
      to:      email.trim(),
      subject: `Got your message`,
      html:    buildConfirmationEmail({ name: safeName, subject: safeSubject, message: safeMessage }),
    }),
  ]);

  if (notif.error || confirm.error) {
    console.error("[contact] Resend error:", notif.error ?? confirm.error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email me directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

// ── Email templates ───────────────────────────────────────────────────
// Rajdhani is loaded via Google Fonts @import (works in Gmail web, Apple Mail,
// iOS Mail). Outlook ignores @import — the sans-serif stack covers it gracefully.

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');`;

const HEADING_STYLE =
  `font-family:'Rajdhani','Barlow Condensed',Impact,sans-serif;` +
  `font-weight:700;font-size:26px;letter-spacing:0.06em;` +
  `text-transform:uppercase;color:#f5c518;margin:0;line-height:1.15;`;

const LABEL_STYLE =
  `font-family:'Rajdhani','Barlow Condensed',Impact,sans-serif;` +
  `font-weight:700;font-size:11px;letter-spacing:0.2em;` +
  `text-transform:uppercase;color:#f5c518;margin:0 0 4px;`;

function buildNotificationEmail(p: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${FONT_IMPORT}</style>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#000000;border:1px solid #222222">

        <!-- Top accent bar -->
        <tr><td style="height:3px;background:#f5c518;padding:0"></td></tr>

        <!-- Header -->
        <tr><td style="padding:36px 40px 28px">
          <p style="${LABEL_STYLE}">// New message</p>
          <h1 style="${HEADING_STYLE}">Portfolio Contact</h1>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><div style="height:1px;background:#222222"></div></td></tr>

        <!-- Sender details -->
        <tr><td style="padding:28px 40px 0">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;width:90px;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#666666;vertical-align:top">Name</td>
              <td style="padding:10px 0;color:#ffffff;font-size:15px">${p.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#666666;vertical-align:top">Email</td>
              <td style="padding:10px 0">
                <a href="mailto:${p.email}" style="color:#f5c518;text-decoration:none;font-size:15px">${p.email}</a>
              </td>
            </tr>
            ${p.subject ? `<tr>
              <td style="padding:10px 0;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#666666;vertical-align:top">Subject</td>
              <td style="padding:10px 0;color:#ffffff;font-size:15px">${p.subject}</td>
            </tr>` : ""}
          </table>
        </td></tr>

        <!-- Message label -->
        <tr><td style="padding:24px 40px 0">
          <p style="${LABEL_STYLE}">// Message</p>
        </td></tr>

        <!-- Message body -->
        <tr><td style="padding:12px 40px 0">
          <div style="background:#0d0d0d;border-left:3px solid #f5c518;padding:20px;color:#ffffff;font-size:15px;line-height:1.7;white-space:pre-wrap;word-break:break-word">${p.message}</div>
        </td></tr>

        <!-- Reply CTA -->
        <tr><td style="padding:32px 40px">
          <a href="mailto:${p.email}" style="display:inline-block;padding:13px 28px;background:#f5c518;color:#000000;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none">
            Reply to ${p.name}
          </a>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><div style="height:1px;background:#222222"></div></td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px">
          <p style="margin:0;font-size:11px;color:#444444;letter-spacing:0.1em;text-transform:uppercase;font-family:'Rajdhani','Barlow Condensed',sans-serif">
            mthokozisi.com &middot; IP: ${p.ip}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildConfirmationEmail(p: {
  name: string;
  subject: string;
  message: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${FONT_IMPORT}</style>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#000000;border:1px solid #222222">

        <!-- Top accent bar -->
        <tr><td style="height:3px;background:#f5c518;padding:0"></td></tr>

        <!-- Header -->
        <tr><td style="padding:36px 40px 28px">
          <p style="${LABEL_STYLE}">// Confirmed</p>
          <h1 style="${HEADING_STYLE}">Got your message, ${p.name}.</h1>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><div style="height:1px;background:#222222"></div></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px 24px">
          <p style="margin:0 0 16px;color:#ffffff;font-size:15px;line-height:1.7">
            Thanks for reaching out. I read every message personally and will get back to you shortly.
          </p>
          <p style="margin:0;color:#999999;font-size:15px;line-height:1.7">
            Here&rsquo;s a copy of what you sent:
          </p>
        </td></tr>

        <!-- Their message -->
        <tr><td style="padding:0 40px 36px">
          ${p.subject ? `<p style="margin:0 0 12px;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#f5c518">Subject: ${p.subject}</p>` : ""}
          <div style="background:#0d0d0d;border-left:3px solid #f5c518;padding:20px;color:#ffffff;font-size:15px;line-height:1.7;white-space:pre-wrap;word-break:break-word">${p.message}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><div style="height:1px;background:#222222"></div></td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px">
          <p style="margin:0 0 6px;font-family:'Rajdhani','Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;color:#ffffff">
            Mthokozisi Dhlamini
          </p>
          <p style="margin:0 0 6px;font-size:13px;color:#666666">Cloud &amp; Software Engineer</p>
          <a href="https://www.mthokozisi.com" style="font-size:12px;color:#f5c518;text-decoration:none;letter-spacing:0.05em">
            www.mthokozisi.com
          </a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
