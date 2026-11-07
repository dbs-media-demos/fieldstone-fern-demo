import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cursor } from "@/components/layout/Chrome";
import { agencyName, agencyUrl, noindex, site, siteUrl } from "@/content/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
  // Desktop only: phones use two small files of their own (globals.css), so nothing here may preload.
  preload: false,
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  preload: false,
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
  display: "swap",
  // Small eyebrow labels only: not worth a preload on the critical path.
  preload: false,
});

const PHONE_ONLY = "(max-width: 767px), (hover: none) and (pointer: coarse)";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.legalName} | Landscaping & Lawn Care in Southlake, TX`,
    template: `%s | ${site.legalName}`,
  },
  description: site.description,
  applicationName: site.legalName,
  authors: [{ name: agencyName, url: agencyUrl }],
  creator: agencyName,
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
        <link rel="preload" href="/fonts/fraunces-phone.woff2" as="font" type="font/woff2" crossOrigin="" media={PHONE_ONLY} />
        <link rel="preload" href="/fonts/fraunces-italic-phone.woff2" as="font" type="font/woff2" crossOrigin="" media={PHONE_ONLY} />
        <SmoothScroll />
        {/* Header, footer and the rest come from (site)/layout or for/[token]/layout (SiteChrome) */}
        {children}
        <Cursor />
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
