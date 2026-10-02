import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceAreaMap } from "@/components/sections/ServiceAreaMap";
import { CityMarquee, CtaBand } from "@/components/sections/Blocks";
import { cities } from "@/content/cities";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from "@/lib/schema";

const title = "Service Areas: Southlake, Keller, Colleyville & Fort Worth";
const description =
  "Fieldstone & Fern serves Southlake, Keller, Colleyville, Grapevine, Flower Mound and west Fort Worth with weekly lawn care and landscape design. Crews on route every weekday.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Service areas", path: "/service-areas" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/service-areas", eyebrow: "Service areas", image: "estate-driveway" });

export default function AreasPage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/service-areas", name: title, description, type: "CollectionPage" }),
          breadcrumbSchema(crumbs),
          itemListSchema(cities.map((c) => ({ name: `Landscaping in ${c.name}, TX`, path: `/service-areas/${c.slug}` }))),
        )}
      />
      <PageHero
        eyebrow="Service areas"
        title={
          <>
            Six cities, <span className="t-italic text-lantern">daily</span> routes.
          </>
        }
        lead="Our yard is in Southlake. Weekly crews run routes across northeast Tarrant and southern Denton County every weekday, so your crew is never far away."
        image="estate-driveway"
        crumbs={crumbs}
      />

      <section className="theme-sand pt-24 sm:pt-32">
        <div className="wrap pb-24">
          <ServiceAreaMap />
        </div>
        <CityMarquee />
      </section>

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="cities-title">
        <div className="wrap">
          <SectionHead id="cities-title" eyebrow="Cities" title={<>Find your neighborhood.</>} />
          <Reveal stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link key={c.slug} href={`/service-areas/${c.slug}`} data-cursor="Explore" className="group relative block overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[4/5]">
                  <Photo slug={c.hero} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7 text-cream">
                  <p className="t-eyebrow text-lantern">{c.drive}</p>
                  <h2 className="t-h3 mt-3">{c.name}, TX</h2>
                  <p className="mt-2 text-sm text-cream/80">{c.neighborhoods.slice(0, 4).join(" · ")}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                    {c.yards} <Arrow />
                  </p>
                </div>
              </Link>
            ))}
          </Reveal>
          <p className="mt-12 max-w-2xl text-muted">
            Also taking design-build projects in Trophy Club, Westlake, Roanoke and Hurst. Not sure if we come to you? Call, and we&rsquo;ll tell you in ten seconds.
          </p>
        </div>
      </section>

      <CtaBand />
    </PageShell>
  );
}
