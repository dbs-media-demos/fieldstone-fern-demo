import type { Metadata } from "next";
import { PageShell, PageHero, JsonLd } from "@/components/ui/Page";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand, GoogleG, ReviewCard, Stars } from "@/components/sections/Blocks";
import { ratingBreakdown, reviews } from "@/content/misc";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Reviews: 4.9★ from 312 Neighbors";
const description =
  "Read reviews of Fieldstone & Fern's weekly lawn care, patios, lighting and landscape design from homeowners in Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Reviews", path: "/reviews" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/reviews", eyebrow: "Reviews", image: "lawn-chairs-golden" });

export default function ReviewsPage() {
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/reviews", name: title, description }), breadcrumbSchema(crumbs))} />
      <PageHero
        eyebrow="Reviews"
        title={
          <>
            312 neighbors, <span className="t-italic text-lantern">one</span> theme: the same crew.
          </>
        }
        image="lawn-chairs-golden"
        crumbs={crumbs}
      />

      <section className="theme-cream py-24 sm:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="rounded-[1.75rem] border border-line bg-bg p-8 lg:sticky lg:top-28">
              <div className="flex items-center gap-4">
                <GoogleG className="h-10 w-10" />
                <div>
                  <p className="font-display text-6xl leading-none tracking-[-0.05em]">{site.rating.value}</p>
                  <Stars className="mt-2 text-[#e3a008]" />
                </div>
              </div>
              <p className="mt-4 text-muted">Based on {site.rating.count} Google reviews</p>
              <dl className="mt-8 space-y-2.5">
                {ratingBreakdown.map((r) => (
                  <div key={r.stars} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                    <dt>{r.stars} ★</dt>
                    <dd className="relative h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
                      <span className="absolute inset-y-0 left-0 rounded-full bg-[#e3a008]" style={{ width: `${r.pct}%` }} />
                    </dd>
                    <dd className="text-right text-muted">{r.pct}%</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 border-t border-line pt-6 text-sm text-muted">
                Reviews shown here are illustrative for this concept site. On a live site they would be pulled from the Google Business Profile.
              </p>
            </div>
          </aside>
          <Reveal stagger={0.06} className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {reviews.map((r) => (
              <ReviewCard key={r.name + r.date} r={r} />
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Be our next <span className="t-italic text-lantern">five stars.</span>
          </>
        }
        image="lawn-stripes-shadow"
      />
    </PageShell>
  );
}
