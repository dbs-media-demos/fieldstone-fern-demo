import type { Metadata } from "next";
import { site } from "@/content/site";

export const ogImageUrl = (title: string, eyebrow?: string, image?: string) => {
  const params = new URLSearchParams({ title });
  if (eyebrow) params.set("eyebrow", eyebrow);
  if (image) params.set("image", image);
  return `/api/og?${params.toString()}`;
};

export function buildMetadata({
  title,
  description,
  path,
  eyebrow,
  image,
  absoluteTitle,
}: {
  /** Page title without the brand suffix (the root template appends it). */
  title: string;
  description: string;
  path: string;
  eyebrow?: string;
  /** Photo slug to use behind the share image. */
  image?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const og = ogImageUrl(title, eyebrow, image);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.legalName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.legalName,
      title: fullTitle,
      description,
      locale: "en_US",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [og] },
  };
}
