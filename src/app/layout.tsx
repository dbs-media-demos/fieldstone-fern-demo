import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cursor, DemoPill, MobileBar } from "@/components/layout/Chrome";
import { JsonLd } from "@/components/ui/Page";
import { noindex, site, siteUrl } from "@/content/site";
import { businessSchema, graph, websiteSchema } from "@/lib/schema";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
  display: "swap",
  // Small eyebrow labels only: not worth a preload on the critical path.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.legalName} | Landscaping & Lawn Care in Southlake, TX`,
    template: `%s | ${site.legalName}`,
  },
  description: site.description,
  applicationName: site.legalName,
  authors: [{ name: "DBS Media", url: "https://dbs-media.com" }],
  creator: "DBS Media",
  formatDetection: { telephone: false },
  robots: noindex
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : { index: true, follow: true },
  category: "Landscaping",
};

export const viewport: Viewport = {
  themeColor: "#16241c",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${hanken.variable} ${dmMono.variable}`}>
      <body className="theme-cream min-h-screen">
        <a
          href="#main"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-forest px-5 py-3 text-cream transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <JsonLd data={graph(businessSchema(), websiteSchema())} />
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
        <MobileBar />
        <DemoPill />
        <Cursor />
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
