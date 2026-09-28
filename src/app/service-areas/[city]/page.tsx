import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Button, Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ui/Cards";
import { CtaBand, FaqList, GoogleG, Stars } from "@/components/sections/Blocks";
import { cities, getCity } from "@/content/cities";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { absoluteUrl, site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema, webPageSchema } from "@/lib/schema";

export const dynamicParams = false;
export const generateStaticParams = () => cities.map((c) => ({ city: c.slug }));

export async function generateMetadata(props: PageProps<"/service-areas/[city]">): Promise<Metadata> {
  const { city } = await props.params;
  const c = getCity(city);
  if (!c) return {};
  return buildMetadata({
    title: `Landscaping & Lawn Care in ${c.name}, TX`,
    description: `Same-crew weekly lawn care, landscape design, patios and lighting in ${c.name}, TX (${c.zips.join(", ")}). ${c.yards}. Free estimates.`,
    path: `/service-areas/${c.slug}`,
    eyebrow: `${c.name}, TX`,
    image: c.hero,
  });
}

export default async function CityPage(props: PageProps<"/service-areas/[city]">) {
  const { city } = await props.params;
  const c = getCity(city);
  if (!c) notFound();

  const path = `/service-areas/${c.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Service areas", path: "/service-areas" },
    { name: c.name, path },
  ];
  const local = projects.filter((p) => p.city === c.name);
  const shown = (local.length ? local : projects).slice(0, 3);
  const cityFaqs = [
    { q: `Do you offer weekly lawn care in ${c.name}?`, a: `Yes. We run weekly routes in ${c.name} every weekday, with the same crew on the same day each week. ${c.yards}.` },
    { q: `How quickly can you start in ${c.name}?`, a: "Most new lawn customers get their first visit within 7 days of the yard walk. Design consults are usually booked within two weeks." },
    { q: `Which ${c.name} neighborhoods do you serve?`, a: `All of them, including ${c.neighborhoods.join(", ")}.` },
  ];

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: `Landscaping in ${c.name}, TX`, description: c.intro }),
          serviceSchema({
            name: `Landscaping & lawn care in ${c.name}, TX`,
            description: c.intro,
            path,
            serviceType: "Landscaping",
            image: c.hero,
            areaName: `${c.name}, TX`,
            offers: services.map((s) => s.name),
          }),
          {
            "@type": "Place",
            "@id": `${absoluteUrl(path)}#place`,
            name: `${c.name}, Texas`,
            geo: { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng },
            containedInPlace: { "@type": "State", name: "Texas" },
          },
          breadcrumbSchema(crumbs),
          faqSchema(cityFaqs),
        )}
      />
      <PageHero
        eyebrow={`Service area · ${c.zips.join(" · ")}`}
        title={
          <>
            Landscaping in <span className="t-italic text-lantern">{c.name}.</span>
          </>
        }
        lead={c.intro}
        image={c.hero}
        crumbs={crumbs}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button href={`/free-estimate?city=${c.slug}`} variant="light">
            Free estimate in {c.name}
          </Button>
          <span className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-cream/85">{c.drive}</span>
        </div>
      </PageHero>

      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead
              eyebrow={`Why ${c.name} picks us`}
              title={
                <>
                  We know <span className="t-italic">these</span> yards.
                </>
              }
            />
            <Reveal as="ul" stagger={0.1} className="mt-12 space-y-8">
              {c.local.map((l, i) => (
                <li key={l.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line pt-6">
                  <span className="t-eyebrow pt-1 text-accent">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.01em]">{l.title}</h3>
                    <p className="mt-2 text-muted">{l.text}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <figure className="rounded-[1.75rem] bg-forest p-8 text-cream">
              <div className="flex items-center gap-3">
                <GoogleG className="h-6 w-6" />
                <Stars className="text-[#f0c14b]" />
              </div>
              <blockquote className="font-display mt-6 text-2xl leading-snug tracking-[-0.015em]">&ldquo;{c.review.text}&rdquo;</blockquote>
              <figcaption className="mt-6 text-sm text-cream/70">
                {c.review.name} · {c.review.where}
              </figcaption>
            </figure>
            <div className="mt-6 rounded-[1.75rem] border border-line p-8">
              <h2 className="t-eyebrow text-faint">Neighborhoods we serve</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {c.neighborhoods.map((n) => (
                  <li key={n} className="rounded-full bg-surface px-3.5 py-1.5 text-sm">
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted">
                {c.yards}. Rated {site.rating.value}★ across {site.rating.count} reviews.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="theme-sand py-24 sm:py-32" aria-labelledby="csvc-title">
        <div className="wrap">
          <SectionHead id="csvc-title" eyebrow={`Services in ${c.name}`} title={<>Everything, one crew.</>} />
          <Reveal as="ul" stagger={0.05} className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] bg-line sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <li key={s.slug} className="bg-sand">
                <Link href={`/services/${s.slug}`} className="group flex h-full min-h-40 flex-col justify-between gap-6 p-6 transition-colors hover:bg-cream">
                  <span className="font-display text-2xl tracking-[-0.02em]">
                    {s.short} <span className="sr-only">in {c.name}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-muted group-hover:text-fg">
                    Learn more <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="cproj-title">
        <div className="wrap">
          <SectionHead id="cproj-title" eyebrow={local.length ? `Projects in ${c.name}` : "Recent projects nearby"} title={<>Work you can drive past.</>} />
          <Reveal stagger={0.1} className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-sand py-24 sm:py-32" aria-labelledby="cfaq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">{c.name} FAQ</p>
            <h2 id="cfaq-title" className="t-h2 mt-5">
              Local <span className="t-italic">questions.</span>
            </h2>
          </div>
          <FaqList items={cityFaqs} className="lg:col-span-8" />
        </div>
        <div className="wrap mt-20">
          <p className="t-eyebrow text-faint">Other areas</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {cities
              .filter((x) => x.slug !== c.slug)
              .map((x) => (
                <li key={x.slug}>
                  <Link href={`/service-areas/${x.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-5 hover:bg-forest hover:text-cream">
                    {x.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title={
          <>
            {c.name} yards, <span className="t-italic text-lantern">kept</span> like home.
          </>
        }
      />
    </PageShell>
  );
}
