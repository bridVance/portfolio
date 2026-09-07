import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT, whatsappUrl } from "@/lib/contact";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Start a project, or ask for a sample agent built on your own content.",
  path: "/contact",
});

const wa = whatsappUrl("Hi BridVance — I'd like to talk about a project.");

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Start a project"
        lede="Tell us what you want handled. We reply within one business day, and we will say early if AI is not the right answer."
      />

      <section aria-labelledby="contact-form" className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
        <h2 id="contact-form" className="sr-only">
          Send an enquiry
        </h2>
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.08}>
            {/* The form is the main path; these are the ones that keep working
                when it does not, so they are stated rather than tucked away. */}
            <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
              <p className="font-mono text-sm uppercase tracking-[0.14em] text-fg">
                Or reach us directly
              </p>
              {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ul role="list" className="mt-4 flex flex-col gap-3 font-body">
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-fg underline underline-offset-4 hover:text-accent"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                {wa ? (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener"
                      className="text-fg underline underline-offset-4 hover:text-accent"
                    >
                      WhatsApp
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ) : null}
              </ul>

              <div aria-hidden className="my-6 h-px w-full bg-line" />

              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                What helps
              </p>
              {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ul role="list" className="mt-3 flex flex-col gap-2 font-body text-sm text-muted">
                <li>What happens today, and what you would rather happened.</li>
                <li>Roughly how often it happens.</li>
                <li>What you already run the business on.</li>
              </ul>
              <p className="mt-5 font-body text-sm text-muted">
                No budget needed to start a conversation. If the answer is that
                you do not need AI for this, we will say so.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
