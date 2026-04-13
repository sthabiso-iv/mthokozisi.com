import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact
 * Accepts the contact form submission and validates it.
 *
 * TODO: replace mailto fallback with a proper email service (e.g. Resend, AWS SES, or Nodemailer)
 *
 * Example with Resend:
 *   import { Resend } from 'resend';
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: 'Portfolio <noreply@mthokozisi.com>',
 *     to: 'hello@mthokozisi.com',
 *     subject: subject || `Portfolio contact from ${name}`,
 *     html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
 *   });
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, subject, message } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  // ── Validation ────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // ── Log submission (replace this block with real email delivery) ──
  console.log("[contact] New submission:", {
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || "(no subject)",
    message: message.trim(),
    receivedAt: new Date().toISOString(),
  });

  // TODO: replace mailto fallback with a proper email service (e.g. Resend, AWS SES, or Nodemailer)
  // The submission is accepted and logged. Wire up an email service to deliver it.

  return NextResponse.json({ success: true }, { status: 200 });
}
