import type { ReactNode } from "react";
import Link from "next/link";
import { PageShell, SectionHead } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Button, Arrow } from "@/components/ui/Button";
import { Counter, Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { Hero } from "@/components/sections/Hero";
import { ServicesList } from "@/components/sections/ServicesList";
import { SeasonsScroll } from "@/components/sections/SeasonsScroll";
import { ProjectsRail } from "@/components/sections/ProjectsRail";
import { NightReveal } from "@/components/sections/NightReveal";
import { LawnPlanBuilder } from "@/components/sections/LawnPlanBuilder";
import { ProcessStack } from "@/components/sections/ProcessStack";
import { ServiceAreaMap } from "@/components/sections/ServiceAreaMap";
import { CityMarquee, CtaBand, FaqList, ReviewsWall } from "@/components/sections/Blocks";
import { faqs, stats } from "@/content/misc";
import { PreviewMap } from "@/components/preview/PreviewMap";
import { defaultBiz } from "@/lib/biz";
import { openDays, type Biz } from "@/lib/biz-core";

const homeFaqs = faqs.filter((_, i) => [0, 1, 4, 5, 8].includes(i));

export { homeFaqs };

type Stat = { value: number; suffix: string; label: string; decimals?: number };

/** A preview states only what's true of the real business: its rating and opening days. */
function previewStats(biz: Biz): Stat[] {
  const days = openDays(biz);
  return [
    ...(biz.rating ? [{ value: biz.rating.value, suffix: "★", label: `from ${biz.rating.count} Google reviews`, decimals: 1 }] : []),
    ...(days ? [{ value: days, suffix: "", label: "days a week we pick up" }] : []),
    { value: 1, suffix: "", label: "crew, every visit" },
    { value: 1, suffix: "-yr", label: "plant warranty" },
  ];
}

/**
 * The homepage sections. The concept site renders them as they are; a personalised preview
 * (/for/<token>) passes a real business: its name, phone, hours, rating and a map of its address
 * replace Fieldstone & Fern's, and the Southlake service-area map and city ticker step aside.
 */
export function HomeContent({ biz = defaultBiz, children }: { biz?: Biz; children?: ReactNode }) {
  const statList = biz.preview ? previewStats(biz) : stats;
  return (
    <PageShell>
      {children}
      <Hero />

      {/* Statement */}
      <section className="theme-cream relative overflow-hidden py-28 sm:py-36">
        <div aria-hidden className="leaf-shadows">
          <div style={{ top: "-20%", right: "-15%" }} />
        </div>
        <div className="wrap relative grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal as="p" className="t-eyebrow text-accent">
              {biz.preview ? biz.area : "Since 2009 · Southlake, Texas"}
            </Reveal>
            <ScrubWords
              className="font-display mt-8 text-[clamp(1.75rem,3.6vw,3.6rem)] leading-[1.12] tracking-[-0.025em]"
              text="We’re a landscape studio and a lawn crew under one roof. The people who design your patio are the people who edge your lawn every Thursday, so the garden we plant is the garden you keep."
            />
            <Reveal className="mt-12 flex flex-wrap gap-3" delay={0.1}>
              <Button href="/about">Our story</Button>
              <Button href="/services" variant="ghost">
                All services
              </Button>
            </Reveal>
          </div>
          <div className="relative hidden lg:col-span-4 lg:block">
            <Parallax className="aspect-[3/4] w-full rounded-t-[999px] rounded-b-[1.5rem]" reveal="arch" amount={14}>
              <div className="absolute inset-0">
                <Photo slug="planting-golden" sizes="30vw" />
              </div>
            </Parallax>
            <Parallax className="absolute -bottom-16 -left-24 aspect-square w-48 rounded-full border-[6px] border-cream" amount={10}>
              <div className="absolute inset-0">
                <Photo slug="fiddlehead" sizes="200px" />
              </div>
            </Parallax>
          </div>
        </div>

        <div className="wrap relative mt-24">
          <Reveal as="dl" stagger={0.08} className="grid grid-cols-2 gap-y-10 border-t border-line pt-10 lg:grid-cols-4">
            {statList.map((s) => (
              <div key={s.label} className="pr-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} className="font-display block text-[clamp(3rem,6vw,5.6rem)] leading-none tracking-[-0.045em]" />
                  <span className="mt-3 block text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Two ways we work */}
      <section className="theme-sand py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            eyebrow="Two ways we work"
            title={
              <>
                Every week, or <span className="t-italic">once</span> in a lifetime.
              </>
            }
            aside="Most of our customers start with one and end up with both: a patio built by our design team, kept perfect by the weekly crew that comes with it."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {[
              {
                href: "/lawn-plans",
                img: "crew-mowing",
                k: "Recurring",
                t: "Weekly lawn care",
                d: "Same crew, same day, a text before we arrive. From $45 a visit.",
              },
              {
                href: "/services/landscape-design",
                img: "patio-firepit-house",
                k: "Design & build",
                t: "Landscape projects",
                d: "Consult, 3D design, install, care plan. Patios, kitchens, lighting, planting.",
              },
            ].map((c, i) => (
              <Reveal key={c.href} delay={i * 0.1}>
                <Link href={c.href} data-cursor="Explore" className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4]">
                  <Photo slug={c.img} sizes="(min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-cream sm:p-9">
                    <div>
                      <p className="t-eyebrow text-lantern">{c.k}</p>
                      <h3 className="t-h3 mt-3">{c.t}</h3>
                      <p className="mt-3 max-w-sm text-cream/80">{c.d}</p>
                    </div>
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream text-forest transition-transform duration-500 group-hover:rotate-[-45deg]">
                      <Arrow />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="services-title">
        <div className="wrap">
          <SectionHead
            id="services-title"
            eyebrow="Services"
            title={
              <>
                Everything outside, <span className="t-italic">handled.</span>
              </>
            }
            aside="Seven services, one team, one number to call. Hover a service to preview it."
          />
          <div className="mt-14">
            <ServicesList />
          </div>
        </div>
      </section>

      <SeasonsScroll />

      <ProjectsRail />

      {/* Before / after */}
      <section className="theme-sand py-24 sm:py-32" aria-labelledby="ba-title">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <Reveal as="p" className="t-eyebrow text-accent">
              Before · After
            </Reveal>
            <h2 id="ba-title" className="t-h2 mt-5">
              Same yard. <span className="t-italic">Six</span> weeks.
            </h2>
            <Reveal className="mt-6 space-y-4 text-muted" delay={0.1}>
              <p>
                The Harmons in Timarron had a fenced rectangle of tired Bermuda. Now they have a flagstone courtyard with a fire pit that&rsquo;s lit
                every evening from October to March.
              </p>
              <p className="text-sm">Drag the handle, or focus it and use your arrow keys.</p>
              <Link href="/projects/southlake-courtyard-patio" className="inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium text-fg">
                See the project <Arrow />
              </Link>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <BeforeAfter before="before-empty-yard" after="patio-firepit-house" label="Timarron courtyard" className="aspect-[4/3] sm:aspect-[16/10]" />
          </div>
        </div>
      </section>

      <NightReveal />

      {/* Lawn plan builder */}
      <section id="lawn-plan" className="theme-cream relative overflow-hidden py-24 sm:py-32" aria-labelledby="builder-title">
        <div aria-hidden className="leaf-shadows">
          <div style={{ bottom: "-30%", left: "-20%" }} />
        </div>
        <div className="wrap relative">
          <SectionHead
            id="builder-title"
            eyebrow="Lawn plan builder"
            title={
              <>
                Price your lawn in <span className="t-italic">ten</span> seconds.
              </>
            }
            aside="Slide to your yard size, pick services and frequency. No email required. When you like the number, we’ll confirm it with a free yard walk."
          />
          <div className="mt-14">
            <LawnPlanBuilder />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="theme-forest py-24 sm:py-32" aria-labelledby="process-title">
        <div className="wrap">
          <SectionHead
            id="process-title"
            eyebrow="How a project works"
            title={
              <>
                Consult. Design. Install. <span className="t-italic text-lantern">Care.</span>
              </>
            }
            aside="One crew lead from first stake to final walkthrough, a 3D design you approve before we dig, and a 1-year plant warranty when we keep caring for it."
          />
          <div className="mt-16">
            <ProcessStack />
          </div>
        </div>
      </section>

      <section className="theme-cream py-24 sm:py-32">
        <ReviewsWall biz={biz} />
      </section>

      {biz.preview ? (
        <PreviewMap biz={biz} />
      ) : (
        <>
          {/* Service area */}
          <section className="theme-sand pt-24 sm:pt-32" aria-labelledby="area-title">
            <div className="wrap">
              <SectionHead
                id="area-title"
                eyebrow="Service area"
                title={
                  <>
                    Six cities, <span className="t-italic">daily</span> routes.
                  </>
                }
                aside="Our yard is in Southlake. Crews are on route across northeast Tarrant and southern Denton County every weekday."
              />
              <div className="mt-14 pb-20">
                <ServiceAreaMap />
              </div>
            </div>
            <CityMarquee />
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="faq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="t-eyebrow text-accent">
              FAQ
            </Reveal>
            <h2 id="faq-title" className="t-h2 mt-5">
              Good <span className="t-italic">questions.</span>
            </h2>
            <Link href="/faq" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium">
              All FAQs <Arrow />
            </Link>
          </div>
          <FaqList items={homeFaqs} className="lg:col-span-8" />
        </div>
      </section>

      <CtaBand biz={biz} />
    </PageShell>
  );
}
