/**
 * The embedded case-study sites.
 *
 * Each one is a real route under /demo, rendered by its own root layout so it
 * owns its whole document — palette, fonts, background. They are listed here
 * rather than discovered from the filesystem so /work can describe them
 * without importing any of their code.
 */
export type Demo = {
  slug: string;
  /** Shown as the card heading. */
  name: string;
  /** The kind of business, for people who do not recognise the name. */
  sector: string;
  line: string;
  /** What this piece is meant to demonstrate — the reason it is in a portfolio. */
  shows: readonly string[];
  /** Built and embedded, or still being written. */
  ready: boolean;
};

export const DEMOS: readonly Demo[] = [
  {
    slug: "sauce",
    name: "Vegan sauce brand",
    sector: "Direct-to-consumer food",
    line: "A small-batch condiment label with a working storefront: products, a cart that survives browsing, and a checkout that adds up.",
    shows: ["Storefront", "Working cart", "Brand system"],
    ready: true,
  },
  {
    slug: "dates",
    name: "Dates importer",
    sector: "Speciality food, retail and wholesale",
    line: "A premium dates retailer, rebuilt around the produce rather than the catalogue.",
    shows: ["Storefront", "Wholesale enquiry", "Editorial"],
    ready: true,
  },
  {
    slug: "distributor",
    name: "Distributor portal",
    sector: "B2B wholesale",
    line: "Bulk ordering with tiered pricing, credit terms and reorder history — the screens a distributor lives in.",
    shows: ["Dashboard", "Data tables", "Bulk cart"],
    ready: true,
  },
  {
    slug: "clinic",
    name: "Clinic booking",
    sector: "Healthcare",
    line: "Practitioners, real availability and a booking that takes under a minute.",
    shows: ["Scheduling", "Intake form", "Reminders"],
    ready: true,
  },
  {
    slug: "restaurant",
    name: "Restaurant",
    sector: "Hospitality",
    line: "Menu, room and table booking, for a place people decide on from their phone.",
    shows: ["Menu", "Reservations", "Photography"],
    ready: true,
  },
  {
    slug: "watches",
    name: "Vintage watch marketplace",
    sector: "Luxury resale",
    line: "Listings with condition grading and provenance, where the detail page has to do the selling.",
    shows: ["Marketplace", "Provenance", "Editorial"],
    ready: true,
  },
] as const;
