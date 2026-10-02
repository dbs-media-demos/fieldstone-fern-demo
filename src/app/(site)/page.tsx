import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/Page";
import { HomeContent, homeFaqs } from "@/components/sections/HomeContent";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";
import { faqSchema, graph, webPageSchema } from "@/lib/schema";

const title = `${site.legalName} | Landscaping & Lawn Care in Southlake, TX`;
const description =
  "Same-crew weekly lawn care, landscape design, patios, outdoor kitchens and lighting for Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth. 4.9★ from 312 reviews.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/", absoluteTitle: true, eyebrow: "Southlake · Fort Worth, TX", image: "estate-lawn-hedges" });

export default function Home() {
  return (
    <HomeContent>
      <JsonLd data={graph(webPageSchema({ path: "/", name: title, description }), faqSchema(homeFaqs))} />
    </HomeContent>
  );
}
