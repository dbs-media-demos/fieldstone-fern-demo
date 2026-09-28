import type { Metadata } from "next";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { Mark } from "@/components/brand/Logo";
import { Parallax, Reveal, ScrubWords, Counter } from "@/components/ui/Reveal";
import { ProcessStack } from "@/components/sections/ProcessStack";
import { CtaBand } from "@/components/sections/Blocks";
import { stats, team } from "@/content/misc";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, businessId, graph, webPageSchema } from "@/lib/schema";

const title = "About Us: A Southlake Landscape Studio & Lawn Crew";
const description =
  "Founded in Southlake in 2009 by horticulturist Daniel Reyes. One team for landscape design, hardscaping and weekly lawn care, with the same crew every week and a 1-year plant warranty.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

const values = [
  { t: "Same crew, every week", d: "Routes are built around people, not trucks. Your crew lead stays your crew lead." },
  { t: "Designed for August", d: "Texas-tough plants, drip irrigation and shade where it matters. Gardens that look good in the heat, not just in April." },
  { t: "Water-wise by default", d: "Our gardens typically use 40–60% less water than lawn. Smart controllers on every system we touch." },
  { t: "Guaranteed, in writing", d: "A 1-year plant warranty and a 5-year hardscape workmanship warranty. If it fails, we fix it." },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/about", eyebrow: "About", image: "planting-golden" });

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(webPageSchema({ path: "/about", name: title, description, type: "AboutPage" }), breadcrumbSchema(crumbs), {
          "@type": "LandscapingBusiness",
          "@id": businessId,
          founder: { "@type": "Person", name: team[0].name, jobTitle: "Founder & Horticulturist" },
          numberOfEmployees: { "@type": "QuantitativeValue", value: 64 },
        })}
      />
      <PageHero
        eyebrow={`About · Since ${site.founded}`}
        title={
          <>
            A landscape studio and a lawn crew, <span className="t-italic text-lantern">under one roof.</span>
          </>
        }
        image="planting-golden"
        crumbs={crumbs}
      />

      <section className="theme-cream relative overflow-hidden py-24 sm:py-32">
        <div aria-hidden className="leaf-shadows">
          <div style={{ top: "-10%", left: "-25%" }} />
        </div>
        <div className="wrap relative grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="t-eyebrow text-accent">Our story</p>
            <ScrubWords
              className="font-display mt-7 text-[clamp(1.6rem,3vw,3rem)] leading-[1.16] tracking-[-0.02em]"
              text="Daniel Reyes started Fieldstone & Fern in 2009 with one truck, one mower and a horticulture degree from Texas A&M. He kept noticing the same thing: beautiful gardens installed by one company, then slowly ruined by a mow-and-go crew from another."
            />
            <Reveal className="prose-ff mt-10 max-w-2xl">
              <p>
                So we built both halves. A design studio led by landscape architect <strong>Hannah Brooks</strong> that draws every garden in 3D, and weekly lawn
                crews that keep those gardens growing the way they were designed.
              </p>
              <p>
                Seventeen seasons later we&rsquo;re 64 people, 1,400+ yards a week and still based in Southlake. Most of our crew leads have been with us more
                than five years, which is why &ldquo;same crew, every week&rdquo; is a promise and not a slogan.
              </p>
            </Reveal>
          </div>
          <div className="relative lg:col-span-5">
            <Parallax className="aspect-[4/5] rounded-t-[999px] rounded-b-[1.5rem]" reveal="arch" amount={12}>
              <div className="absolute inset-0">
                <Photo slug="wheelbarrow" sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            </Parallax>
            <Parallax className="absolute -bottom-10 -left-6 aspect-square w-40 rounded-full border-[6px] border-cream sm:w-52" amount={8}>
              <div className="absolute inset-0">
                <Photo slug="fiddlehead-2" sizes="210px" />
              </div>
            </Parallax>
          </div>
        </div>

        <div className="wrap relative mt-28">
          <Reveal as="dl" stagger={0.08} className="grid grid-cols-2 gap-y-10 border-t border-line pt-10 lg:grid-cols-4">
            {stats.map((s) => (
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

      <section className="theme-sand py-24 sm:py-32" aria-labelledby="values-title">
        <div className="wrap">
          <SectionHead
            id="values-title"
            eyebrow="What we believe"
            title={
              <>
                Four promises we <span className="t-italic">actually</span> keep.
              </>
            }
          />
          <Reveal as="ul" stagger={0.08} className="mt-14 grid gap-5 md:grid-cols-2">
            {values.map((v, i) => (
              <li key={v.t} className="flex gap-6 rounded-[1.75rem] bg-bg p-8">
                <span className="font-display text-5xl leading-none tracking-[-0.05em] text-moss">0{i + 1}</span>
                <div>
                  <h3 className="t-h3">{v.t}</h3>
                  <p className="mt-3 text-muted">{v.d}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="team-title">
        <div className="wrap">
          <SectionHead
            id="team-title"
            eyebrow="The team"
            title={
              <>
                The people <span className="t-italic">in</span> your yard.
              </>
            }
            aside="Sixty-four of us in total. These are the leads you're most likely to meet."
          />
          <Reveal as="ul" stagger={0.07} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <li key={m.name} className="group relative overflow-hidden rounded-[1.75rem] border border-line p-8">
                <div className="flex items-center justify-between">
                  <span className="font-display flex h-16 w-16 items-center justify-center rounded-full bg-fern text-2xl text-cream">
                    {m.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </span>
                  <Mark className="h-10 w-10 text-sage transition-transform duration-700 group-hover:rotate-12" />
                </div>
                <h3 className="font-display mt-8 text-2xl tracking-[-0.02em]">{m.name}</h3>
                <p className="t-eyebrow mt-2 text-accent">{m.role}</p>
                <p className="mt-4 text-muted">{m.note}</p>
                <span aria-hidden className="t-eyebrow absolute right-8 top-28 text-faint">
                  0{i + 1}
                </span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-forest py-24 sm:py-32" aria-labelledby="aproc-title">
        <div className="wrap">
          <SectionHead
            id="aproc-title"
            eyebrow="How we work"
            title={
              <>
                Consult. Design. Install. <span className="t-italic text-lantern">Care.</span>
              </>
            }
          />
          <div className="mt-16">
            <ProcessStack />
          </div>
        </div>
      </section>

      <section className="theme-cream py-20">
        <div className="wrap">
          <p className="t-eyebrow text-faint">Credentials</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {site.credentials.map((c) => (
              <li key={c} className="flex items-center gap-4 rounded-2xl border border-line p-5">
                <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-moss" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M12 2l7 3v6c0 5-3 9-7 11-4-2-7-6-7-11V5l7-3Z" />
                  <path d="M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </PageShell>
  );
}
