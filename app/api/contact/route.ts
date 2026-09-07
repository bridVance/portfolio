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

  return NextResponse.json({ ok: true });
}
