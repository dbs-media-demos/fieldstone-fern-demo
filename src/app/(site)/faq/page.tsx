import type { Metadata } from "next";
import { PageShell, PageHero, JsonLd } from "@/components/ui/Page";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand, FaqList } from "@/components/sections/Blocks";
import { faqs } from "@/content/misc";
import { services } from "@/content/services";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Landscaping & Lawn Care FAQ";
const description =
  "Answers about our same-crew lawn plans, text-before-arrival, the 1-year plant warranty, design process, pricing, service area and Texas-specific care like oak wilt and watering rules.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "FAQ", path: "/faq" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/faq", eyebrow: "FAQ", image: "oak-sunset" });

const groups = [...new Set(faqs.map((f) => f.group))];
const serviceFaqs = services.flatMap((s) => s.faqs.slice(0, 1).map((f) => ({ ...f, group: s.short })));

export default function FaqPage() {
  const all = [...faqs, ...serviceFaqs];
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/faq", name: title, description, type: "FAQPage" }), breadcrumbSchema(crumbs), faqSchema(all))} />
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Good <span className="t-italic text-lantern">questions.</span>
          </>
        }
        lead="Everything homeowners ask us before their first yard walk. Can't find yours? Text us: a real person answers."
        image="oak-sunset"
        crumbs={crumbs}
      />
      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap space-y-24">
          {[...groups, "By service"].map((g) => (
            <div key={g} className="grid gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <h2 className="t-h3">{g}</h2>
              </Reveal>
              <FaqList items={g === "By service" ? serviceFaqs : faqs.filter((f) => f.group === g)} className="lg:col-span-8" />
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </PageShell>
  );
}
