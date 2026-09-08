import { NextResponse } from "next/server";
import { CONTACT } from "@/lib/contact";

/**
 * Enquiry intake. Posts to Resend's REST API directly rather than pulling in
 * the SDK — it is one fetch, and the dependency would be the only thing in the
 * tree we did not need.
 *
 * With RESEND_API_KEY unset this answers 503 and says so, and the form surfaces
 * the email address instead. That is the deliberate behaviour: an enquiry is
 * the one thing on this site that must never be silently swallowed, so a
 * missing key has to look like a missing key.
 */
export const runtime = "nodejs";

const MAX = { name: 120, email: 200, message: 4000 };

/**
 * Text the enquiry to the studio phone.
 *
 * CONTACT_PHONE is read here and nowhere else. It has no NEXT_PUBLIC_ prefix,
 * so Next refuses to inline it into any client bundle, and this module is a
 * route handler that never ships to the browser — the number cannot reach a
 * page, a bundle or the DOM. A test asserts that.
 *
 * Twilio because one authenticated POST covers both SMS and WhatsApp: prefix
 * TWILIO_FROM and CONTACT_PHONE with `whatsapp:` and the same call delivers
 * there instead. Unconfigured, this is a no-op — the email is the path that
 * must work, and a missing SMS key should never lose an enquiry.
 */
async function textTheStudio(summary: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.CONTACT_PHONE;
  if (!sid || !token || !from || !to) return false;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: summary }),
      }
    );
    return res.ok;
  } catch {
    // The email already carries the enquiry; a failed text must not fail the
    // request or the sender is told their message did not land when it did.
    return false;
  }
}

type Body = { name?: unknown; email?: unknown; message?: unknown; company?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot: a real person never sees this field, so anything in it is a bot.
  // Answer 200 so the bot has nothing to learn from the difference.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Tell us who you are.";
  else if (name.length > MAX.name) errors.name = "That name is too long.";
  // Deliberately permissive: the only authority on whether an address works is
  // the mail server, and a clever pattern mostly rejects real people.
  if (!email) errors.email = "We need somewhere to reply.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX.email)
    errors.email = "That does not look like an email address.";
  if (!message) errors.message = "Tell us what you want handled.";
  else if (message.length > MAX.message) errors.message = "That is longer than we can take.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "not-configured", email: CONTACT.email },
      { status: 503 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Resend's shared sender, which needs no verified domain. Swap for a
      // studio address once one exists.
      from: process.env.CONTACT_FROM ?? "BridVance <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? CONTACT.email],
      reply_to: email,
      subject: `Enquiry from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    // Never pretend an enquiry landed. The client shows the address instead.
    return NextResponse.json(
      { error: "send-failed", email: CONTACT.email },
      { status: 502 }
    );
  }

  // Fired after the email is confirmed, and deliberately not awaited into the
  // result: the enquiry is already safe, so a slow or failing SMS provider
  // should not hold up the reply or turn a delivered message into an error.
  const texted = await textTheStudio(
    `New enquiry from ${name} (${email})\n\n${message.slice(0, 900)}`
  );

  return NextResponse.json({ ok: true, texted });
}
