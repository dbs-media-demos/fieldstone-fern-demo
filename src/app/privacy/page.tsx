import type { Metadata } from "next";
import { PageShell, Breadcrumbs, JsonLd } from "@/components/ui/Page";
import { site, mailHref, agencyName } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Privacy Policy";
const description = "How Fieldstone & Fern Landscapes collects, uses and protects information submitted through this website.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Privacy", path: "/privacy" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/privacy", eyebrow: "Legal" });

export default function PrivacyPage() {
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/privacy", name: title, description }), breadcrumbSchema(crumbs))} />
      <section className="theme-cream relative pb-28 pt-[calc(var(--header-h)+5rem)]">
        <div className="theme-forest absolute inset-x-0 top-0 h-[var(--header-h)]" aria-hidden />
        <div className="wrap max-w-3xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="t-h1 anim-heading mt-8">Privacy policy</h1>
          <p className="mt-4 text-muted">Last updated September 28, 2026</p>
          <div className="prose-ff mt-12">
            <p>
              <strong>This is a concept website.</strong> {site.legalName} is a fictional business created by {agencyName} to demonstrate a landscaping
              website. Forms on this site validate your input but do not send or store it anywhere.
            </p>
            <h2>What a live version would collect</h2>
            <p>When you request an estimate or send a message, a business like ours would collect:</p>
            <ul>
              <li>Your name, phone number and email address, so we can reply and schedule a visit.</li>
              <li>Property details you choose to share (city, yard size, optional address) to prepare an accurate estimate.</li>
              <li>Basic, anonymous analytics about how the site is used, to improve it.</li>
            </ul>
            <h2>How it would be used</h2>
            <p>
              Only to respond to your request, schedule and perform services, send visit notifications you opted into (like text-before-arrival), and
              bill for work. We would never sell your information or share it with third parties for marketing.
            </p>
            <h2>Text messages</h2>
            <p>
              Customers on lawn plans receive service texts about upcoming visits. Reply STOP at any time to opt out; message and data rates may apply.
            </p>
            <h2>Cookies</h2>
            <p>This demo site sets no tracking or advertising cookies. It stores a single session value if you dismiss the concept-site notice.</p>
            <h2>Your choices</h2>
            <p>
              You could ask to see, correct or delete your information at any time by emailing <a href={mailHref}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
