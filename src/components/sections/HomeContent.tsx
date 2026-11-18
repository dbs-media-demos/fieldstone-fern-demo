import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { PageShell, SectionHead } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Button, Arrow } from "@/components/ui/Button";
import { Counter, Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";
import { Hero } from "@/components/sections/Hero";
import { No3D } from "@/lib/no-3d";
import { ServicesList } from "@/components/sections/ServicesList";
import { WorkModes } from "@/components/sections/WorkModes";
import { BeforeAfterGrow } from "@/components/sections/BeforeAfterGrow";
import { SeasonsScroll } from "@/components/sections/SeasonsScroll";
import { ProjectsRail } from "@/components/sections/ProjectsRail";
import { NightReveal } from "@/components/sections/NightReveal";
import { LawnPlanBuilder } from "@/components/sections/LawnPlanBuilder";
import { ProcessStack } from "@/components/sections/ProcessStack";
import { ServiceAreaMap } from "@/components/sections/ServiceAreaMap";
import { CityMarquee, CtaBand, FaqList, ReviewsWall } from "@/components/sections/Blocks";
import { faqs, stats } from "@/content/misc";
import { mapCities } from "@/content/cities";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { PreviewMap } from "@/components/preview/PreviewMap";
import { LazyPlantingBed } from "@/components/fx/LazyPlantingBed";
import { BudgetGuide, PhoneTeam, QuoteSection } from "@/components/sections/PhoneSections";
import { defaultBiz } from "@/lib/biz";
import { openDays, type Biz } from "@/lib/biz-core";

/** Where a section sits on phones (project work: gallery, reviews, how it works + budget, team, form). Desktop keeps the source order. */
const at = (order: number) => ({ "--o": order }) as CSSProperties;

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
 *
 * Two versions, one tree: `hero="3d"` is / (the real-time 3D lawn), `hero="2d"` is /v2 (the same
 * page for a slow laptop or a lead who doesn't want 3D): a 2D lawn-striping hero, and the 3D yard
 * further down keeps its stills. Zero three.js on /v2 at any width. Phones see the same page on both.
 */
export function HomeContent({ biz = defaultBiz, hero = "3d", children }: { biz?: Biz; hero?: "3d" | "2d"; children?: ReactNode }) {
  const statList = biz.preview ? previewStats(biz) : stats;
  const page = (
    <PageShell>
      {children}
      <div className="home-flow">
      <div style={at(1)}>
        {hero === "3d" ? <Hero /> : <Hero variant="2d" />}
      </div>

      {/* Statement */}
      <div style={at(8)}>
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
              className="font-display mt-8 text-[clamp(1.75rem,3.6vw,3.6rem)] leading-[1.12] tracking-[-0.025em] phone:!mt-2 phone:!text-[1.2rem] phone:!leading-[1.22]"
              text="We’re a landscape studio and a lawn crew under one roof. The people who design your patio are the people who edge your lawn every Thursday, so the garden we plant is the garden you keep."
            />
            <Reveal className="mt-12 flex flex-wrap gap-3 phone:!mt-3 phone:!gap-2" delay={0.1}>
              <Button href="/about" className="phone:!min-h-10 phone:!px-5 phone:!py-2">
                Our story
              </Button>
              <Button href="/services" variant="ghost" className="phone:!min-h-10 phone:!px-5 phone:!py-2">
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

        <div className="wrap relative mt-36 sm:mt-40 lg:mt-24 phone:!mt-5">
          <LazyPlantingBed className="absolute bottom-full left-[var(--gutter)] aspect-[10/3] w-[calc(100%-2*var(--gutter))] lg:w-[58%]" />
          <Reveal as="dl" stagger={0.08} className="grid grid-cols-2 gap-y-10 border-t border-line pt-10 lg:grid-cols-4 phone:!gap-y-3 phone:!pt-3">
            {statList.map((s) => (
              <div key={s.label} className="pr-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} className="font-display block text-[clamp(3rem,6vw,5.6rem)] leading-none tracking-[-0.045em] phone:!text-[2.1rem]" />
                  <span className="mt-3 block text-muted phone:!mt-0.5 phone:!text-[0.84rem] phone:!leading-tight">{s.label}</span>
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      </div>

      {!biz.preview && (
        <div style={at(9)}>
          <PhoneTeam />
        </div>
      )}

      {/* Two ways we work */}
      <div style={at(10)}>
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
          <WorkModes />
        </div>
      </section>

      </div>

      {/* Services */}
      <div style={at(11)}>
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
            aside={
              <>
                Seven services, one team, one number to call. <span className="phone:hidden">Hover a service to preview it.</span>
              </>
            }
          />
          <div className="mt-14">
            <ServicesList services={services.map(({ slug, short, summary, hero, kind }) => ({ slug, short, summary, hero, kind }))} />
          </div>
        </div>
      </section>

      </div>

      <div style={at(13)}>
        <SeasonsScroll />
      </div>

      <div style={at(2)}>
        <ProjectsRail projects={projects.map(({ slug, title, city, category, year, hero }) => ({ slug, title, city, category, year, hero }))} />
      </div>

      <div style={at(4)}>
        <BeforeAfterGrow />
      </div>

      <div style={at(12)}>
        <NightReveal />
      </div>

      {/* Lawn plan builder */}
      <div style={at(7)}>
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

      </div>

      {/* Process */}
      <div style={at(5)}>
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

      </div>

      <div style={at(6)}>
        <BudgetGuide />
      </div>

      <div style={at(3)}>
      <section className="theme-cream py-24 sm:py-32">
        <ReviewsWall biz={biz} />
      </section>
      </div>

      <div style={at(14)}>
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
              <div className="mt-14 pb-20 phone:!pb-6">
                <ServiceAreaMap cities={mapCities} />
              </div>
            </div>
            <CityMarquee />
          </section>
        </>
      )}

      </div>

      {/* FAQ */}
      <div style={at(15)}>
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="faq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12 phone:!grid-cols-1 phone:!gap-3">
          <div className="lg:col-span-4">
            <Reveal as="p" className="t-eyebrow text-accent">
              FAQ
            </Reveal>
            <div className="phone:flex phone:items-end phone:justify-between phone:gap-3">
              <h2 id="faq-title" className="t-h2 mt-5">
                Good <span className="t-italic">questions.</span>
              </h2>
              <Link href="/faq" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium phone:!mt-0 phone:shrink-0 phone:!text-sm">
                All FAQs <Arrow />
              </Link>
            </div>
          </div>
          <FaqList items={homeFaqs} className="lg:col-span-8" />
        </div>
      </section>

      </div>

      <div style={at(16)}>
        <CtaBand biz={biz} formBelow />
      </div>

      <div style={at(17)}>
        <QuoteSection />
      </div>
      </div>
    </PageShell>
  );
  return hero === "3d" ? page : <No3D>{page}</No3D>;
}
