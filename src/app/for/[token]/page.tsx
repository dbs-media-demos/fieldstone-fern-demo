import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "@/components/sections/HomeContent";
import { previewBiz } from "@/lib/preview";

// Always the CRM's current data: an edit there shows on the next reload
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const biz = await previewBiz((await params).token);
  const robots = { index: false, follow: false, googleBot: { index: false, follow: false } };
  if (!biz) return { title: "Preview not found", robots };
  const place = [biz.address.city || biz.area, biz.address.region].filter(Boolean).join(", ");
  const title = `${biz.name} | Landscaping & Lawn Care in ${place || biz.area}`;
  const description = `Same-crew weekly lawn care, landscape design, patios and lighting across ${biz.area}. Free estimates. Call ${biz.phoneDisplay || "us"}.`;
  return {
    title: { absolute: title },
    description,
    robots,
    alternates: { canonical: null },
    openGraph: { type: "website", siteName: biz.name, title, description, images: [] },
    twitter: { card: "summary", title, description },
  };
}

export default async function PreviewPage({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent biz={biz} />;
}
