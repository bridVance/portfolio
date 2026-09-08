import { NextResponse } from "next/server";
import { CONTACT } from "@/lib/contact";
import { envOr } from "@/lib/env";
import { callerKey, rateLimit } from "@/lib/rateLimit";

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

// Generous for a person — nobody sends five enquiries in ten minutes by hand —
// and tight enough that a flood costs real time. The email quota is the asset
// being protected: 3,000 a month goes quickly under a loop.
const LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

// Refuse a body before parsing it. Beyond this the request cannot be valid
// anyway, and request.json() would otherwise buffer whatever arrived first.
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Reject a cross-origin POST.
 *
 * A browser always sends Origin on a cross-origin POST, so a mismatch is the
 * attack and refusing it is the control. A *missing* Origin is a non-browser
 * client — curl, a script — which this check cannot stop in any case, so it
 * passes through to the rest of the validation rather than being refused on a
 * signal that proves nothing.
 */
function crossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== new URL(request.url).origin;
  } catch {
    return true; // unparseable Origin is not something to trust
  }
}

// A newline in a field that becomes a mail header is the classic injection
// route. Resend takes JSON so the risk is low, but the name reaches a Subject
// and the address a Reply-To, and no C0 control belongs in either. The whole
// range rather than the three obvious ones: picking favourites here is how
// the fourth gets through. The message body is exempt: newlines are the point.
// oxlint-disable-next-line no-control-regex
const hasControlChars = (s: string) => /[\u0000-\u001f\u007f]/.test(s);

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

// Nothing here is cacheable, and an enquiry sitting in a shared cache is the
// kind of thing you only find out about later.
const NO_STORE = { "Cache-Control": "no-store" };

function refuse(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  // Ordered by cost. Each check is cheaper than the one after it, and the rate
  // limit lands before the body is read so a flood costs a header lookup
  // rather than a parse and a provider call.

  // Our form always sends JSON. Requiring it is what stops a cross-origin
  // <form> POST outright: a form can only send three simple content types and
  // this is not one of them, so such a request never reaches the preflight it
  // would fail.
  const contentType = (request.headers.get("content-type") ?? "").split(";")[0]!.trim();
  if (!contentType.toLowerCase().endsWith("json")) {
    return refuse(415, "unsupported-media-type");
  }

  if (crossOrigin(request)) return refuse(403, "cross-origin");

  const limit = rateLimit(callerKey(request.headers), LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate-limited", retryAfter: limit.retryAfter },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfter) } }
    );
  }

  // Content-Length is a claim, not a fact, so it is a cheap early out and the
  // measured length below is the actual limit.
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return refuse(413, "too-large");
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return refuse(413, "too-large");

  let body: Body;
  try {
    body = JSON.parse(raw);
  } catch {
    return refuse(400, "Malformed request.");
  }
  // `null` and `"hello"` are both valid JSON, and both used to reach the field
  // reads below and throw.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return refuse(400, "Malformed request.");
  }

  // Honeypot: a real person never sees this field, so anything in it is a bot.
  // Answer 200 so the bot has nothing to learn from the difference.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Tell us who you are.";
  else if (name.length > MAX.name) errors.name = "That name is too long.";
  else if (hasControlChars(name)) errors.name = "That name has characters we cannot use.";
  // Deliberately permissive: the only authority on whether an address works is
  // the mail server, and a clever pattern mostly rejects real people.
  if (!email) errors.email = "We need somewhere to reply.";
  else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > MAX.email ||
    hasControlChars(email)
  )
    errors.email = "That does not look like an email address.";
  if (!message) errors.message = "Tell us what you want handled.";
  else if (message.length > MAX.message) errors.message = "That is longer than we can take.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 400, headers: NO_STORE });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "not-configured", email: CONTACT.email },
      { status: 503, headers: NO_STORE }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Resend's shared sender, which needs no verified domain. Swap for a
      // studio address once one exists.
      from: envOr("CONTACT_FROM", "BridVance <onboarding@resend.dev>"),
      to: [envOr("CONTACT_TO", CONTACT.email)],
      reply_to: email,
      subject: `Enquiry from ${name}`,
      text: `${name} <${email}>

${message}`,
    }),
  });

  if (!res.ok) {
    // The provider's reason is the only thing that explains a failed send, and
    // throwing it away made a 502 undiagnosable from outside — a wrong key in
    // the dashboard and a rejected recipient look identical from here. Logged
    // server-side, so it reaches the platform's function log and never the
    // sender, whose problem it is not.
    console.error(
      `contact: provider refused the send (${res.status})`,
      await res.text().catch(() => "<no body>")
    );
    // Never pretend an enquiry landed. The client shows the address instead.
    return NextResponse.json(
      { error: "send-failed", email: CONTACT.email },
      { status: 502, headers: NO_STORE }
    );
  }

  // Fired after the email is confirmed: the enquiry is already safe, so a slow
  // or failing SMS provider must not turn a delivered message into an error.
  const texted = await textTheStudio(
    `New enquiry from ${name} (${email})

${message.slice(0, 900)}`
  );

  return NextResponse.json({ ok: true, texted }, { headers: NO_STORE });
}
