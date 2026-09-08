import { test } from "@playwright/test";

let n = 0;

/**
 * Headers that put a request in a rate-limit bucket of its own.
 *
 * The limiter keys on the caller's address. Against a local server there is no
 * proxy to set one, so every request in the suite looks like the same
 * anonymous caller — the sixth would take a 429 and the failure would land on
 * whichever spec happened to run last. This gives each one its own key.
 *
 * Call it once and reuse the result when a test needs several requests counted
 * together; call it again for a request that must start fresh.
 */
export function freshCaller(): Record<string, string> {
  const info = test.info();
  n += 1;
  // Slugged, because a forwarding chain is comma-separated and the server
  // reads only the first entry — a comma in a test title silently merged
  // several "different" callers into one bucket.
  const label = `${info.project.name}-${info.title}`.replace(/[^a-zA-Z0-9]+/g, "-");
  return { "x-forwarded-for": `test-${label}-${n}` };
}
