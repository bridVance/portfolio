"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CONTACT } from "@/lib/contact";

type Errors = Partial<Record<"name" | "email" | "message", string>>;
type State = "idle" | "sending" | "sent" | "failed" | "limited";

const field =
  "mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2.5 font-body text-fg " +
  "placeholder:text-muted focus-visible:border-accent";

/**
 * The enquiry form. Server-validated as well as client-validated — this is the
 * one thing on the site that must not quietly fail, so every failure path ends
 * with the email address rather than a shrug.
 */
/**
 * A mailto carrying the enquiry the visitor already typed.
 *
 * The fallback used to be the address on its own, which asks someone to retype
 * everything into their mail client — most will not, and the enquiry is lost.
 * This opens their mail app with it already written, so a provider outage
 * costs one click rather than the lead.
 */
function mailtoFor(to: string, d: { name: string; email: string; message: string }) {
  const body = `${d.message}\n\n—\n${d.name}\n${d.email}`;
  return `mailto:${to}?subject=${encodeURIComponent(
    `Enquiry from ${d.name || "the website"}`
  )}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState({ name: "", email: "", message: "" });
  const [retryAfter, setRetryAfter] = useState(0);
  const statusRef = useRef<HTMLOutputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const listed = Object.entries(errors) as [keyof Errors, string][];

  // After a failed submit focus sits on the button, so a field's
  // aria-describedby error is never read and nothing tells a screen reader user
  // what went wrong. Focus moves to this summary, and each line jumps to its
  // field. The inline errors stay: the summary is in addition, not instead.
  useEffect(() => {
    if (listed.length) summaryRef.current?.focus();
  }, [listed.length]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setDraft({
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      message: String(data.message ?? ""),
    });
    setState("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setState("sent");
        form.reset();
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (payload.errors) {
        setErrors(payload.errors);
        setState("idle");
      } else if (res.status === 429) {
        // Being told "that did not send" reads as a fault to fix and invites
        // the retry the limit is there to stop. Say what happened instead, and
        // keep the mail-app route open — a real sender is not the reason the
        // limit tripped and should not be made to wait.
        setRetryAfter(Number(payload.retryAfter) || 0);
        setState("limited");
        statusRef.current?.focus();
      } else {
        setState("failed");
        statusRef.current?.focus();
      }
    } catch {
      setState("failed");
      statusRef.current?.focus();
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">Sent</p>
        <p className="mt-2 font-body text-muted">
          We have it, and we reply within one business day. If you do not hear
          back, email{" "}
          <a className="text-fg underline underline-offset-4" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>{" "}
          directly &mdash; something went wrong on our side, not yours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl border border-line bg-surface p-6 md:p-8"
    >
      {listed.length ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="form-error-title"
          className="mb-6 rounded-lg border border-line bg-surface-2 p-4"
        >
          <p
            id="form-error-title"
            className="font-mono text-sm uppercase tracking-[0.14em] text-fg"
          >
            There is a problem
          </p>
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul role="list" className="mt-2 flex flex-col gap-1">
            {listed.map(([field, message]) => (
              <li key={field}>
                <a
                  href={`#${field}`}
                  className="font-body text-sm text-fg underline underline-offset-4"
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className={field}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={field}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field id="message" label="What do you want handled?" error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={5}
            className={cn(field, "resize-y")}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "message-error" : undefined}
            placeholder="The job, roughly. What happens today, and what you would rather happened."
          />
        </Field>
      </div>

      {/* Honeypot. Hidden from sight and from screen readers, and skipped by
          the tab order — only a bot ever fills it in. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex items-center rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-colors hover:bg-accent-strong focus-visible:bg-accent-strong disabled:opacity-70"
        >
          {state === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <output ref={statusRef} tabIndex={-1} className="font-body text-sm text-muted">
          {state === "limited" ? (
            <>
              That is more enquiries than we take from one place at a time.
              {retryAfter ? ` Try again in ${Math.ceil(retryAfter / 60)} min` : " Try again shortly"}
              , or{" "}
              <a
                className="font-medium text-fg underline underline-offset-4"
                href={mailtoFor(CONTACT.email, draft)}
              >
                send it from your mail app
              </a>{" "}
              now &mdash; we have filled it in already.
            </>
          ) : state === "failed" ? (
            <>
              That did not send.{" "}
              <a
                className="font-medium text-fg underline underline-offset-4"
                href={mailtoFor(CONTACT.email, draft)}
              >
                Send it from your mail app
              </a>{" "}
              &mdash; we have filled it in already. It goes to {CONTACT.email}.
            </>
          ) : null}
        </output>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-body text-sm text-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
