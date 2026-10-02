import type { Metadata } from "next";
import clsx from "clsx";
import { PageShell, PageHero, JsonLd, SectionHead } from "@/components/ui/Page";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { LawnPlanBuilder } from "@/components/sections/LawnPlanBuilder";
import { CtaBand, FaqList } from "@/components/sections/Blocks";
import { plans } from "@/content/pricing";
import { faqs } from "@/content/misc";
import { absoluteUrl, site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, businessId, faqSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Lawn Care Plans & Pricing";
const description =
  "Month-to-month weekly lawn care plans from $189/month in Southlake, Keller, Colleyville and Fort Worth. Same crew every week, text-before-arrival, 7-step fertilization. Price your lawn in seconds.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Lawn plans", path: "/lawn-plans" },
];
const lawnFaqs = faqs.filter((f) => f.group === "Lawn care");

const texts = [
  { time: "Wed 6:02 pm", who: "them", text: "Hi Dana 👋 Luis and crew will be at 412 Timarron tomorrow between 8 and 9 am. Gate code still 2468?" },
  { time: "Wed 6:10 pm", who: "you", text: "Yes! Dog will be inside 🙏" },
  { time: "Thu 8:14 am", who: "them", text: "On our way, about 15 minutes out." },
  { time: "Thu 9:02 am", who: "them", text: "All done ✅ Mowed at 3\", edged beds, blew the drive. Front-left sprinkler head was cracked, so we replaced it ($14). Photo 👇" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/lawn-plans", eyebrow: "Lawn plans", image: "striped-lawn" });

export default function LawnPlansPage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/lawn-plans", name: title, description }),
          breadcrumbSchema(crumbs),
          faqSchema(lawnFaqs),
          {
            "@type": "OfferCatalog",
            name: "Lawn care plans",
            url: absoluteUrl("/lawn-plans"),
            itemListElement: plans.map((p) => ({
              "@type": "Offer",
              name: `${p.name} lawn plan`,
              price: p.price,
              priceCurrency: "USD",
              priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "USD", unitText: "MONTH" },
              seller: { "@id": businessId },
              description: p.features.join(", "),
            })),
          },
        )}
      />
      <PageHero
        eyebrow="Lawn plans & pricing"
        title={
          <>
            The same crew, <span className="t-italic text-lantern">every</span> Thursday.
          </>
        }
        lead="Month-to-month weekly lawn care with a fixed price, a text before we arrive and a photo when we leave. No contracts, no surprises."
        image="striped-lawn"
        crumbs={crumbs}
      >
        <Button href="#builder" variant="light">
          Price my lawn
        </Button>
      </PageHero>

      {/* Plans */}
      <section className="theme-cream py-24 sm:py-32" aria-labelledby="plans-title">
        <div className="wrap">
          <SectionHead
            id="plans-title"
            eyebrow="Plans"
            title={
              <>
                Three plans. <span className="t-italic">Zero</span> contracts.
              </>
            }
            aside="Starting prices are for a typical quarter-acre Southlake lot. Your exact price comes from the builder below and a free yard walk."
          />
          <Reveal stagger={0.1} className="mt-16 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <article
                key={p.name}
                className={clsx(
                  "relative flex flex-col rounded-[2rem] p-8 sm:p-10",
                  p.featured ? "theme-forest shadow-2xl shadow-forest/25 lg:-my-6 lg:py-16" : "border border-line bg-bg",
                )}
              >
                {p.featured && <span className="t-eyebrow absolute right-8 top-8 rounded-full bg-lantern px-3 py-1.5 text-forest">Most popular</span>}
                <h3 className="font-display text-4xl tracking-[-0.03em]">{p.name}</h3>
                <p className="mt-2 text-muted">{p.blurb}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="text-muted">from</span>
                  <span className="font-display text-6xl leading-none tracking-[-0.045em]">${p.price}</span>
                  <span className="text-muted">/ mo</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3 border-t border-line pt-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M3 8.5l3 3L13 4.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button href={`/free-estimate?services=lawn-care&plan=${p.name.toLowerCase()}`} variant={p.featured ? "lantern" : "primary"} className="mt-10 w-full">
                  Choose {p.name}
                </Button>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Builder */}
      <section id="builder" className="theme-sand py-24 sm:py-32" aria-labelledby="builder-title">
        <div className="wrap">
          <SectionHead
            id="builder-title"
            eyebrow="Lawn plan builder"
            title={
              <>
                Build it <span className="t-italic">yourself.</span>
              </>
            }
            aside="Drag to your yard size, choose services and frequency, and watch the yard and the price update."
          />
          <div className="mt-14">
            <LawnPlanBuilder />
          </div>
        </div>
      </section>

      {/* Texts */}
      <section className="theme-forest overflow-hidden py-24 sm:py-32" aria-labelledby="texts-title">
        <div className="wrap grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="t-eyebrow text-lantern">Text-before-arrival</p>
            <h2 id="texts-title" className="t-h2 mt-5">
              You&rsquo;ll always know <span className="t-italic text-lantern">who&rsquo;s</span> in your yard.
            </h2>
            <p className="t-lead mt-6 max-w-lg text-muted">
              A heads-up the evening before, an &ldquo;on our way&rdquo; text and a finished-yard photo. Reply to any of them to reach a real person at our Southlake office.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["1", "Crew lead, by name"],
                ["2", "Texts per visit"],
                ["0", "Contracts to sign"],
              ].map(([n, l]) => (
                <div key={l} className="border-t border-line pt-4">
                  <p className="font-display text-5xl leading-none tracking-[-0.04em]">{n}</p>
                  <p className="mt-2 text-sm text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="relative mx-auto w-full max-w-[22rem] rounded-[3rem] border-[10px] border-forest-3 bg-[#f6f2ea] p-4 pt-10 text-forest shadow-2xl shadow-black/40">
              <div aria-hidden className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-forest-3" />
              <p className="text-center text-xs text-forest/60">
                {site.name} · {site.phoneDisplay}
              </p>
              <Reveal as="ol" stagger={0.35} y={16} className="mt-4 space-y-3" aria-label="Example text messages">
                {texts.map((t) => (
                  <li key={t.time} className={clsx("flex flex-col", t.who === "you" ? "items-end" : "items-start")}>
                    <span className="mb-1 px-2 text-[0.68rem] text-forest/60">{t.time}</span>
                    <span
                      className={clsx(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.92rem] leading-snug",
                        t.who === "you" ? "rounded-br-sm bg-fern text-cream" : "rounded-bl-sm bg-white shadow-sm",
                      )}
                    >
                      {t.text}
                    </span>
                  </li>
                ))}
                <li className="flex justify-start">
                  <span className="relative block aspect-[4/3] w-[70%] overflow-hidden rounded-2xl rounded-bl-sm">
                    <Photo slug="front-yard-landscaped" sizes="240px" alt="Photo of a freshly mowed and edged front yard sent after the visit" />
                  </span>
                </li>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-cream py-24 sm:py-32" aria-labelledby="lfaq-title">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">Lawn care FAQ</p>
            <h2 id="lfaq-title" className="t-h2 mt-5">
              The <span className="t-italic">fine</span> print (there isn&rsquo;t much).
            </h2>
          </div>
          <FaqList items={lawnFaqs} className="lg:col-span-8" />
        </div>
      </section>

      <CtaBand image="lawn-chairs-golden" />
    </PageShell>
  );
}
