import type { Metadata } from "next";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { ServiceCard } from "@/components/ui/Cards";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { CtaBand, FaqList } from "@/components/sections/Blocks";
import { SeasonsScroll } from "@/components/sections/SeasonsScroll";
import { services } from "@/content/services";
import { faqs } from "@/content/misc";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from "@/lib/schema";

const title = "Landscaping & Lawn Care Services";
const description =
  "Weekly lawn care, landscape design, hardscaping, outdoor lighting, irrigation, seasonal cleanups and tree care in Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/services", eyebrow: "Services", image: "garden-path-perennials" });

export default function ServicesPage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/services", name: title, description, type: "CollectionPage" }),
          breadcrumbSchema(crumbs),
          itemListSchema(services.map((s) => ({ name: s.name, path: `/services/${s.slug}` }))),
        )}
      />
      <PageHero
        eyebrow="Services"
        title={
          <>
            Everything outside, <span className="t-italic text-lantern">handled.</span>
          </>
        }
        lead="Seven services, one team and one number to call. Weekly care that keeps the yard sharp, plus design-build projects that change how you use it."
        image="garden-path-perennials"
        crumbs={crumbs}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/free-estimate" variant="light">
            Get a free estimate
          </Button>
          <Button href="/lawn-plans" variant="ghost" className="text-cream">
            Lawn plans & pricing
          </Button>
        </div>
      </PageHero>

      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            eyebrow="Recurring care"
            title={
              <>
                Same crew, <span className="t-italic">every</span> visit.
              </>
            }
            aside="Month-to-month plans with a fixed price. Your crew lead's name and number are on your welcome card."
          />
          <Reveal stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services
              .filter((s) => s.kind === "recurring")
              .map((s) => (
                <ServiceCard key={s.slug} s={s} index={services.indexOf(s)} />
              ))}
          </Reveal>

          <SectionHead
            className="mt-28"
            eyebrow="Design & build"
            title={
              <>
                Projects built to <span className="t-italic">outlast</span> the house.
              </>
            }
            aside="Consult, 3D design, install and care plan, with a 5-year workmanship warranty on hardscapes and a 1-year plant warranty."
          />
          <Reveal stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => s.kind === "project")
              .map((s) => (
                <ServiceCard key={s.slug} s={s} index={services.indexOf(s)} />
              ))}
          </Reveal>
        </div>
      </section>

      <SeasonsScroll />

      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">FAQ</p>
            <h2 className="t-h2 mt-5">
              Before you <span className="t-italic">call.</span>
            </h2>
          </div>
          <FaqList items={faqs.slice(0, 5)} className="lg:col-span-8" />
        </div>
      </section>

      <CtaBand />
    </PageShell>
  );
}
