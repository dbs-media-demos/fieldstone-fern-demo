import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, PageHero, JsonLd } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Button, Arrow } from "@/components/ui/Button";
import { Parallax, Reveal, SplitReveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { CtaBand } from "@/components/sections/Blocks";
import { categories, getProject, projects } from "@/content/projects";
import { getService } from "@/content/services";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, projectSchema, webPageSchema } from "@/lib/schema";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProject(slug);
  if (!p) return {};
  return buildMetadata({
    title: `${p.title}, ${p.city} TX`,
    description: p.summary,
    path: `/projects/${p.slug}`,
    eyebrow: `Project · ${p.city}`,
    image: p.hero,
  });
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const p = getProject(slug);
  if (!p) notFound();

  const path = `/projects/${p.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: p.title, path },
  ];
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];
  const cat = categories.find((c) => c.id === p.category)?.label;

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: p.title, description: p.summary }),
          projectSchema({ name: p.title, description: p.summary, path, image: p.hero, year: p.year, city: p.city }),
          breadcrumbSchema(crumbs),
        )}
      />
      <PageHero eyebrow={`${p.neighborhood}, ${p.city} · ${cat} · ${p.year}`} title={p.title} lead={p.summary} image={p.hero} crumbs={crumbs} tall vtName={`project-${p.slug}`} />

      {/* Facts */}
      <section className="theme-cream py-20 sm:py-28">
        <div className="wrap">
          <Reveal as="dl" stagger={0.08} className="grid grid-cols-2 gap-y-10 border-y border-line py-10 lg:grid-cols-4">
            {p.facts.map((f) => (
              <div key={f.label} className="pr-6">
                <dt className="t-eyebrow text-faint">{f.label}</dt>
                <dd className="font-display mt-3 text-[clamp(1.8rem,3.4vw,3rem)] leading-none tracking-[-0.035em]">{f.value}</dd>
              </div>
            ))}
          </Reveal>

          <div className="mt-20 grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="t-eyebrow text-accent">The story</p>
              <div className="prose-ff mt-6 max-w-2xl">
                {p.story.map((para, i) => (
                  <p key={i} className={i === 0 ? "font-display text-[1.6rem] leading-snug tracking-[-0.015em] text-fg" : undefined}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-[1.5rem] bg-surface p-7">
                <h2 className="t-eyebrow text-faint">Scope</h2>
                <ul className="mt-5 space-y-3">
                  {p.scope.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full rounded-bl-none bg-moss" />
                      {x}
                    </li>
                  ))}
                </ul>
                <h2 className="t-eyebrow mt-8 text-faint">Services</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.services.map((s) => (
                    <li key={s}>
                      <Link href={`/services/${s}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm hover:bg-forest hover:text-cream">
                        {getService(s)?.short}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {p.before && p.after && (
        <section className="theme-sand py-24 sm:py-32" aria-labelledby="ba-title">
          <div className="wrap">
            <p className="t-eyebrow text-accent">Before · After</p>
            <h2 id="ba-title" className="t-h2 mt-5">
              Drag to <span className="t-italic">compare.</span>
            </h2>
            <BeforeAfter before={p.before} after={p.after} label={p.title} className="mt-12 aspect-[4/3] sm:aspect-[16/9]" sizes="100vw" />
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="pg-title">
        <div className="wrap">
          <h2 id="pg-title" className="sr-only">
            Project photos
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
            {p.gallery.map((g, i) => {
              const layout = [
                "col-span-2 md:col-span-8 aspect-[16/10]",
                "md:col-span-4 aspect-[3/4] rounded-t-[999px]",
                "md:col-span-4 aspect-[3/4]",
                "col-span-2 md:col-span-8 aspect-[16/10]",
                "md:col-span-6 aspect-[4/3]",
                "md:col-span-6 aspect-[4/3]",
              ][i % 6];
              return (
                <Parallax key={g} className={`rounded-[1.5rem] ${layout}`} amount={10} reveal={i % 2 ? "arch" : "inset"}>
                  <div className="absolute inset-0">
                    <Photo slug={g} sizes={layout.includes("col-span-8") ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 40vw, 50vw"} />
                  </div>
                </Parallax>
              );
            })}
          </div>
        </div>
      </section>

      {p.quote && (
        <section className="theme-forest py-24 sm:py-36">
          <figure className="wrap max-w-5xl text-center">
            <SplitReveal as="blockquote" className="font-display text-[clamp(1.8rem,4vw,3.8rem)] leading-[1.12] tracking-[-0.025em]">
              <span className="text-lantern">&ldquo;</span>
              {p.quote.text}
              <span className="text-lantern">&rdquo;</span>
            </SplitReveal>
            <figcaption className="t-eyebrow mt-10 text-muted">
              {p.quote.name} · {p.neighborhood}, {p.city}
            </figcaption>
          </figure>
        </section>
      )}

      {/* Next project */}
      <section className="theme-cream py-20">
        <div className="wrap">
          <Link href={`/projects/${next.slug}`} data-cursor="Next" className="group grid items-center gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="t-eyebrow text-faint">Next project</p>
              <p className="t-h2 mt-4 transition-colors duration-500 group-hover:text-accent">{next.title}</p>
              <p className="mt-3 text-muted">
                {next.neighborhood}, {next.city}
              </p>
              <span className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium">
                View project <Arrow />
              </span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] md:col-span-7">
              <Photo slug={next.hero} sizes="(min-width: 768px) 58vw, 100vw" className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
            </div>
          </Link>
          <div className="mt-14">
            <Button href="/projects" variant="ghost">
              All projects
            </Button>
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Want one <span className="t-italic text-lantern">like this?</span>
          </>
        }
        image={p.gallery[0]}
      />
    </PageShell>
  );
}
