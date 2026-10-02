import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHero, JsonLd } from "@/components/ui/Page";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { ServiceAreaMap } from "@/components/sections/ServiceAreaMap";
import { site, telHref, mailHref, smsHref } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Contact Fieldstone & Fern";
const description = `Call ${site.phoneDisplay}, text us, or send a message. Office and yard in Southlake, TX. Open Mon–Fri 7–6, Sat 8–2.`;
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/contact", eyebrow: "Contact", image: "house-dusk-lawn" });

export default function ContactPage() {
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/contact", name: title, description, type: "ContactPage" }), breadcrumbSchema(crumbs))} />
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to a <span className="t-italic text-lantern">person.</span>
          </>
        }
        lead="Our Southlake office answers the phone from 7 am on weekdays. Text works too: it's how most customers reach their crew."
        image="house-dusk-lawn"
        crumbs={crumbs}
      >
        <div className="flex flex-wrap gap-3">
          <Button href={telHref} variant="light" icon="phone">
            {site.phoneDisplay}
          </Button>
          <Button href="/free-estimate" variant="ghost" className="text-cream">
            Free estimate
          </Button>
        </div>
      </PageHero>

      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <Reveal className="space-y-5 lg:col-span-4">
            <div className="rounded-[1.75rem] bg-forest p-8 text-cream">
              <p className="t-eyebrow text-lantern">Call or text</p>
              <a href={telHref} className="font-display mt-4 block text-4xl tracking-[-0.03em] underline-offset-4 hover:underline">
                {site.phoneDisplay}
              </a>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={telHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lantern px-5 font-medium text-forest">
                  <PhoneIcon /> Call
                </a>
                <a href={smsHref} className="inline-flex min-h-11 items-center rounded-full border border-cream/30 px-5">
                  Text us
                </a>
              </div>
              <OpenBadge className="mt-6" />
            </div>
            <div className="rounded-[1.75rem] border border-line p-8">
              <p className="t-eyebrow text-faint">Email</p>
              <a href={mailHref} className="mt-3 block text-lg underline-offset-4 hover:underline">
                {site.email}
              </a>
              <p className="t-eyebrow mt-8 text-faint">Office &amp; yard</p>
              <address className="mt-3 not-italic">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.zip}
              </address>
              <p className="t-eyebrow mt-8 text-faint">Hours</p>
              <dl className="mt-3 space-y-1.5">
                {site.hoursDisplay.map((h) => (
                  <div key={h.label} className="flex justify-between gap-6">
                    <dt className="text-muted">{h.label}</dt>
                    <dd>{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <div className="lg:col-span-8">
            <h2 className="t-h3 mb-6">Send a message</h2>
            <ContactForm />
            <p className="mt-6 text-muted">
              Looking for a price? The{" "}
              <Link href="/free-estimate" className="text-accent underline underline-offset-4">
                free estimate form
              </Link>{" "}
              is faster, and it gets you a yard walk.
            </p>
          </div>
        </div>
      </section>

      <section className="theme-sand py-24 sm:py-32" aria-labelledby="where-title">
        <div className="wrap">
          <p className="t-eyebrow text-accent">Where we work</p>
          <h2 id="where-title" className="t-h2 mb-14 mt-5">
            On route <span className="t-italic">near</span> you.
          </h2>
          <ServiceAreaMap />
        </div>
      </section>
    </PageShell>
  );
}
