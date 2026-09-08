/**
 * An environment variable, treating blank as absent.
 *
 * `process.env.X ?? fallback` only falls back on undefined, so a variable that
 * exists with an empty value passes straight through. That is not an exotic
 * state: adding a name in a hosting dashboard and leaving the value blank
 * produces it, and so does copying a .env.example whose lines are all `KEY=`.
 *
 * It cost a working contact form. An empty CONTACT_FROM reached the mail
 * provider as an empty sender, the provider refused the payload, and the route
 * reported a failed send while the API key it was blamed on was fine.
 */
export function envOr(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}
