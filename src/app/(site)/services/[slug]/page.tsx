import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Button, Arrow } from "@/components/ui/Button";
import { Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { ProjectCard } from "@/components/ui/Cards";
import { CtaBand, FaqList } from "@/components/sections/Blocks";
import { LawnPlanBuilder } from "@/components/sections/LawnPlanBuilder";
import { NightReveal } from "@/components/sections/NightReveal";
import { getService, services } from "@/content/services";
import { projects } from "@/content/projects";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema, webPageSchema } from "@/lib/schema";

export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = getService(slug);
  if (!s) return {};
  return buildMetadata({
    title: `${s.name} in Southlake & Fort Worth`,
    description: s.summary,
    path: `/services/${s.slug}`,
    eyebrow: s.short,
    image: s.hero,
  });
}

const BEFORE_AFTER: Record<string, { before: string; after: string; label: string; href: string }> = {
  "landscape-design": { before: "before-weedy-lot", after: "xeriscape-yucca", label: "Keller water-wise front yard", href: "/projects/keller-xeriscape-front-yard" },
  hardscaping: { before: "before-bare-yard", after: "outdoor-kitchen-pool", label: "Colleyville poolside kitchen", href: "/projects/colleyville-outdoor-kitchen" },
  "lawn-care": { before: "before-dead-lawn", after: "striped-lawn", label: "Flower Mound lawn renovation", href: "/projects/flower-mound-lawn-renovation" },
};

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const s = getService(slug);
  if (!s) notFound();

  const path = `/services/${s.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: s.short, path },
  ];
  const related = projects.filter((p) => p.services.includes(s.slug)).slice(0, 3);
  const others = services.filter((x) => x.slug !== s.slug);
  const ba = BEFORE_AFTER[s.slug];

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: s.name, description: s.summary }),
          serviceSchema({ name: s.name, description: s.summary, path, serviceType: s.schemaType, image: s.hero, offers: s.included.map((i) => i.title) }),
          breadcrumbSchema(crumbs),
          faqSchema(s.faqs),
        )}
      />
      <PageHero eyebrow={`Services · ${s.kind === "recurring" ? "Recurring care" : "Design & build"}`} title={s.name} lead={s.summary} image={s.hero} crumbs={crumbs}>
        <div className="flex flex-wrap items-center gap-3">
          <Button href={`/free-estimate?services=${s.slug}`} variant="light">
            Get a free estimate
          </Button>
          <span className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-cream/85">{s.priceNote}</span>
        </div>
      </PageHero>

      {/* Intro */}
      <section className="theme-cream relative overflow-hidden py-24 sm:py-32">
        <div aria-hidden className="leaf-shadows">
          <div style={{ top: "-25%", right: "-20%" }} />
        </div>
        <div className="wrap relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="t-eyebrow text-accent">The short version</p>
            <ScrubWords text={s.intro} className="font-display mt-7 text-[clamp(1.55rem,2.9vw,2.9rem)] leading-[1.18] tracking-[-0.02em]" />
          </div>
          <Reveal as="dl" stagger={0.1} className="grid content-end gap-8 lg:col-span-4">
            {s.stats.map((st) => (
              <div key={st.label} className="border-t border-line pt-5">
                <dt className="sr-only">{st.label}</dt>
                <dd>
                  <span className="font-display block text-5xl leading-none tracking-[-0.04em]">{st.value}</span>
                  <span className="mt-2 block text-muted">{st.label}</span>
                </dd>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Image mosaic */}
        <div className="wrap relative mt-20 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
          <Parallax className="col-span-2 aspect-[16/10] rounded-[1.5rem] md:col-span-7" amount={10}>
            <div className="absolute inset-0">
              <Photo slug={s.images[0]} sizes="(min-width: 768px) 58vw, 100vw" />
            </div>
          </Parallax>
          <Parallax className="aspect-[3/4] rounded-t-[999px] rounded-b-[1.5rem] md:col-span-5 md:mt-24" amount={12} reveal="arch">
            <div className="absolute inset-0">
              <Photo slug={s.images[1]} sizes="(min-width: 768px) 40vw, 50vw" />
            </div>
          </Parallax>
          <Parallax className="aspect-[3/4] rounded-[1.5rem] md:col-span-4 md:-mt-10" amount={12}>
            <div className="absolute inset-0">
              <Photo slug={s.images[2]} sizes="(min-width: 768px) 33vw, 50vw" />
            </div>
          </Parallax>
          <Parallax className="col-span-2 hidden aspect-[16/9] rounded-[1.5rem] md:col-span-8 md:block" amount={10}>
            <div className="absolute inset-0">
              <Photo slug={s.images[3]} sizes="66vw" />
            </div>
          </Parallax>
        </div>
      </section>

      {/* Included */}
      <section className="theme-forest py-24 sm:py-32" aria-labelledby="inc-title">
        <div className="wrap">
          <SectionHead
            id="inc-title"
            eyebrow="What's included"
            title={
              <>
                Done properly, <span className="t-italic text-lantern">every</span> time.
              </>
            }
            aside={s.priceNote}
          />
          <Reveal as="ul" stagger={0.07} className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] bg-line sm:grid-cols-2 lg:grid-cols-3">
            {s.included.map((inc, i) => (
              <li key={inc.title} className="group relative bg-forest p-7 transition-colors duration-500 hover:bg-forest-2 sm:p-9">
                <span className="t-eyebrow text-lantern">0{i + 1}</span>
                <h3 className="font-display mt-8 text-[1.6rem] leading-tight tracking-[-0.02em]">{inc.title}</h3>
                <p className="mt-3 text-muted">{inc.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {s.slug === "lawn-care" && (
        <section className="theme-cream py-24 sm:py-32" aria-labelledby="b-title">
          <div className="wrap">
            <SectionHead
              id="b-title"
              eyebrow="Lawn plan builder"
              title={
                <>
                  Your price, <span className="t-italic">right now.</span>
                </>
              }
            />
            <div className="mt-14">
              <LawnPlanBuilder />
            </div>
          </div>
        </section>
      )}

      {s.slug === "outdoor-lighting" && <NightReveal />}

      {s.slug === "irrigation" && (
        <section className="theme-forest relative isolate overflow-hidden">
          <AutoVideo className="absolute inset-0 -z-10 h-full w-full object-cover" src="/video/sprinkler.mp4" poster="/images/sprinkler-poster.jpg" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/90 via-forest/50 to-transparent" />
          <div className="wrap flex min-h-[70svh] flex-col justify-center py-24">
            <p className="t-eyebrow text-lantern">Water-wise audit</p>
            <h2 className="t-h2 mt-5 max-w-[14ch] text-cream">
              Water the lawn, <span className="t-italic text-lantern">not</span> the street.
            </h2>
            <p className="t-lead mt-6 max-w-md text-cream/85">
              A zone-by-zone catch-cup audit and a smart schedule built for your city&rsquo;s watering days. Customers save 38% on average.
            </p>
          </div>
        </section>
      )}

      {ba && (
        <section className="theme-sand py-24 sm:py-32">
          <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="t-eyebrow text-accent">Before · After</p>
              <h2 className="t-h2 mt-5">{ba.label}</h2>
              <Link href={ba.href} className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium">
                See the project <Arrow />
              </Link>
            </div>
            <div className="lg:col-span-8">
              <BeforeAfter before={ba.before} after={ba.after} label={ba.label} className="aspect-[4/3] sm:aspect-[16/10]" />
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="proc-title">
        <div className="wrap">
          <SectionHead id="proc-title" eyebrow="How it works" title={<>From first call to finished.</>} />
          <Reveal as="ol" stagger={0.1} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {s.process.map((st, i) => (
              <li key={st.title} className="relative rounded-[1.5rem] border border-line p-7">
                <span className="font-display text-6xl leading-none tracking-[-0.05em] text-moss">0{i + 1}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em]">{st.title}</h3>
                <p className="mt-2 text-muted">{st.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="theme-sand py-24 sm:py-32" aria-labelledby="rel-title">
          <div className="wrap">
            <SectionHead id="rel-title" eyebrow="Related projects" title={<>Recent work like this.</>} />
            <Reveal stagger={0.1} className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.slug} p={p} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="sfaq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">FAQ</p>
            <h2 id="sfaq-title" className="t-h2 mt-5">
              {s.short}, <span className="t-italic">answered.</span>
            </h2>
          </div>
          <FaqList items={s.faqs} className="lg:col-span-8" />
        </div>
        <div className="wrap mt-24">
          <p className="t-eyebrow text-faint">Other services</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-5 transition-colors hover:bg-forest hover:text-cream">
                  {o.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand image={s.images[5] ?? "oak-bench"} />
    </PageShell>
  );
}
