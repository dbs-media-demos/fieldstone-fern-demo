import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell, JsonLd, Breadcrumbs } from "@/components/ui/Page";
import { Photo } from "@/components/ui/Photo";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { EstimateForm } from "@/components/forms/EstimateForm";
import { GoogleG, Stars } from "@/components/sections/Blocks";
import { site, telHref } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, graph, webPageSchema } from "@/lib/schema";

const title = "Free Landscaping & Lawn Care Estimate";
const description =
  "Request a free estimate for weekly lawn care, landscape design, patios, lighting or irrigation in Southlake, Keller, Colleyville, Grapevine, Flower Mound or Fort Worth. We reply within one business hour.";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Free estimate", path: "/free-estimate" },
];

export const metadata: Metadata = buildMetadata({ title, description, path: "/free-estimate", eyebrow: "Free estimate", image: "planting-golden" });

export default function EstimatePage() {
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/free-estimate", name: title, description, type: "ContactPage" }), breadcrumbSchema(crumbs))} />
      <section className="theme-cream relative pb-24 pt-[calc(var(--header-h)+2rem)] sm:pb-32">
        <div className="theme-forest absolute inset-x-0 top-0 -z-0 h-[34rem] overflow-hidden lg:h-[40rem]">
          <div className="absolute inset-0 opacity-40">
            <Photo slug="planting-golden" sizes="100vw" preload decorative />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-forest/40 to-forest" />
        </div>
        <div className="wrap relative">
          <Breadcrumbs items={crumbs} className="anim-fade text-cream" />
          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="text-cream lg:col-span-4">
              <p className="t-eyebrow anim-fade text-lantern">Free estimate · 2 minutes</p>
              <h1 className="t-h1 anim-heading mt-5">
                Let&rsquo;s walk <span className="t-italic text-lantern">your</span> yard.
              </h1>
              <p className="anim-fade t-lead mt-6 max-w-sm text-cream/85" style={{ ["--d" as string]: "0.2s" }}>
                Four quick steps. A designer replies within one business hour to book a free, no-pressure yard walk.
              </p>
            </div>
            <div className="lg:col-span-8">
              <Suspense fallback={<div className="h-[36rem] rounded-[2rem] border border-line bg-bg" />}>
                <EstimateForm />
              </Suspense>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:ml-[33.4%]">
            <div className="flex items-center gap-3 rounded-2xl border border-line p-5">
              <GoogleG className="h-7 w-7" />
              <div>
                <Stars className="text-[#e3a008]" />
                <p className="mt-1 text-sm text-muted">
                  {site.rating.value} from {site.rating.count} reviews
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="font-medium">Prefer to talk?</p>
              <a href={telHref} className="text-accent underline-offset-4 hover:underline">
                {site.phoneDisplay}
              </a>
            </div>
            <div className="flex items-center rounded-2xl border border-line p-5">
              <OpenBadge />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
