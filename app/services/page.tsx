import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AgentDemo, type Turn } from "@/components/services/AgentDemo";
import { PartDiagram } from "@/components/services/PartDiagram";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Packaged agents, websites and interfaces, the accelerators both are built from, and bespoke work when none of it fits.",
  path: "/services",
});

/**
 * Illustrative transcripts, not recordings — short enough to read at a glance
 * and concrete enough to be worth reading. Each one ends on the thing the
 * agent actually did, since that is what a buyer is weighing.
 */
const DEMOS: Record<string, readonly Turn[]> = {
  "Enquiry agent": [
    { from: "customer", text: "Do you deliver to Kochi?" },
    { from: "agent", text: "We do — 2 to 3 days, free over ₹1,500. What were you looking at?" },
    { from: "customer", text: "The 5kg box, for an office" },
    { from: "agent", text: "Bulk pricing starts at 10 boxes. Shall I put a quote together and send it here?" },
  ],
  "Booking agent": [
    { from: "customer", text: "Anything Saturday morning?" },
    { from: "agent", text: "10:15 and 11:30 are open with Dr Rao." },
    { from: "customer", text: "11:30 please" },
    { from: "agent", text: "Booked. It is in the clinic calendar, and I will remind you the night before." },
  ],
  "Order agent": [
    { from: "customer", text: "Where is order 4471?" },
    { from: "agent", text: "Out for delivery, arriving today before 6pm." },
    { from: "customer", text: "Can I change the address?" },
    { from: "agent", text: "Not once it is out with the courier — I can reschedule it for tomorrow instead." },
  ],
  "Document assistant": [
    { from: "customer", text: "What is the warranty on the steel tanks?" },
    {
      from: "agent",
      text: "Five years against manufacturing defects. Installation damage is not covered.",
      cite: "Warranty policy, page 3",
    },
  ],
  "Follow-up agent": [
    { from: "agent", text: "Hi Priya — you asked about the 200-unit order last Tuesday. Still useful?" },
    { from: "customer", text: "Yes, sorry — got busy" },
    { from: "agent", text: "No trouble. That quote holds until Friday. Want me to keep it open?" },
  ],
};

/**
 * Three tiers, cheapest and fastest first, so a visitor can find their own
 * budget on the page instead of having to ask. Each tier states what it costs
 * you in time and what you give up, because the honest reason to pick the
 * middle one is that the first is too rigid and the last is too slow.
 */
const TIERS = [
  {
    index: "01",
    label: "Websites",
    title: "Sites people actually use",
    lede: "The other half of the studio, and for most businesses the way in. A site that looks like you rather than the template three competitors also bought, and that holds up on a mid-range phone on a bad connection.",
    items: [
      {
        term: "Business website",
        line: "Who you are, what you sell and how to reach you — built to turn a visitor into an enquiry you can actually answer.",
      },
      {
        term: "Online store",
        line: "Products, payments and order tracking, wired to whatever you already run the business on.",
      },
      {
        term: "Landing pages",
        line: "One page per campaign, built around a single decision, so you can tell what the spend actually did.",
      },
      {
        term: "Dashboards",
        line: "The internal screens your team lives in, designed with the same care as the public site.",
      },
      {
        term: "Rebuilds",
        line: "Same business, a site that no longer works against it — usually faster, clearer, and finally decent on a phone.",
      },
    ],
  },
  {
    index: "02",
    label: "Packaged",
    title: "Agents with a fixed shape",
    lede: "Jobs that come up again and again, scoped and priced as a package. Same skeleton each time, fitted to your business — which is why these land in weeks rather than quarters.",
    items: [
      {
        term: "Enquiry agent",
        line: "Answers the questions you get twenty times a day, qualifies who is worth your time, and hands over the ones that are.",
      },
      {
        term: "Booking agent",
        line: "Takes a booking end to end and writes it into the calendar you already use. Clinics, salons, studios, workshops.",
      },
      {
        term: "Order agent",
        line: "Where is my order, can I change it, can I return it — answered from your own system, at 2am included.",
      },
      {
        term: "Document assistant",
        line: "Answers from your catalogue, policies or manuals, with the page it came from attached.",
      },
      {
        term: "Follow-up agent",
        line: "Chases the quotes and half-finished enquiries nobody got round to calling back.",
      },
    ],
  },
  {
    index: "03",
    label: "Accelerators",
    title: "Parts we already own",
    lede: "The plumbing every build needs, written once and reused. You are not paying us to solve WhatsApp onboarding or calendar sync again — a project starts most of the way up, and the budget goes on what is actually yours.",
    items: [
      {
        term: "Channels",
        line: "WhatsApp Business, web chat, email and forms, wired to the same agent rather than three that disagree.",
      },
      {
        term: "Your systems",
        line: "Calendars, sheets, CRMs, order and inventory systems — read and written, not screenshotted.",
      },
      {
        term: "Retrieval",
        line: "Your documents made answerable, with sources attached so a claim can be checked.",
      },
      {
        term: "Evaluation",
        line: "A set of real cases the agent must pass before it is allowed near a customer, and again after every change.",
      },
      {
        term: "Interface kit",
        line: "The site, dashboard or panel around the agent, on the design system this studio runs on.",
      },
    ],
  },
  {
    index: "04",
    label: "Bespoke",
    title: "Built for one business",
    lede: "When the work does not fit a package — an unusual process, a system nobody else integrates with, a product of your own. Slower and more expensive, and sometimes the only thing that will do.",
    items: [
      {
        term: "Custom agents",
        line: "Multi-step work across your own tools, with the failure cases designed for rather than discovered.",
      },
      {
        term: "Internal tools",
        line: "The dashboard or console your team actually needs, instead of another spreadsheet with rules in someone's head.",
      },
      {
        term: "Product work",
        line: "AI inside something you sell, where the interface matters as much as the model behind it.",
      },
    ],
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we build"
        title="Services"
        lede="Agents, sites, and the parts both are built from. Ready-shaped work first, bespoke last — so you can find your own budget on this page rather than having to ask."
      />

      {TIERS.map((tier) => (
        <section
          key={tier.index}
          aria-labelledby={`tier-${tier.index}`}
          className="mx-auto max-w-6xl px-4 pb-20 md:pb-28"
        >
          <SectionHeading
            label={tier.label}
            id={`tier-${tier.index}`}
            index={tier.index}
          >
            {tier.title}
          </SectionHeading>

          <Reveal>
            <p className="mt-6 max-w-[62ch] font-body text-muted md:text-lg">
              {tier.lede}
            </p>
          </Reveal>

          {/* explicit role="list": Tailwind preflight's list-style:none strips
              the implicit list role in Safari/VoiceOver. */}
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul role="list" className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {tier.items.map((item, i) => (
              <li key={item.term}>
                <Reveal delay={i * 0.05}>
                  <div aria-hidden className="bv-rule h-px w-full bg-line" />
                  <div className="pt-5">
                    <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
                      {item.term}
                    </p>
                    <p className="mt-1 max-w-[46ch] font-body text-muted">
                      {item.line}
                    </p>
                    {DEMOS[item.term] ? (
                      <AgentDemo turns={DEMOS[item.term]} label={item.term} />
                    ) : (
                      <PartDiagram term={item.term} />
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section
        aria-labelledby="services-cta"
        className="border-t border-line bg-surface"
      >
        <Reveal className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <h2 id="services-cta" className="text-2xl font-medium md:text-4xl">
            Not sure which one you need?
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] font-body text-muted">
            Describe the job in a couple of sentences and we will tell you which
            tier it belongs in &mdash; including when the answer is that you do
            not need AI for it.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-colors hover:bg-accent-strong focus-visible:bg-accent-strong"
          >
            Start a project
          </Link>
        </Reveal>
      </section>
    </>
  );
}
