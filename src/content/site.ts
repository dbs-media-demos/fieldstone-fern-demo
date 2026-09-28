/**
 * Business facts for the fictional Fieldstone & Fern Landscapes (DBS Media concept site).
 * Used across the UI, structured data and share images.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fieldstone-fern-demo.vercel.app").replace(/\/$/, "");

export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";

export const site = {
  name: "Fieldstone & Fern",
  legalName: "Fieldstone & Fern Landscapes",
  tagline: "Grown for Texas. Kept like home.",
  description:
    "Landscape design, hardscaping, outdoor lighting and same-crew weekly lawn care for Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth, Texas.",
  url: siteUrl,
  phone: "+18175550164",
  phoneDisplay: "(817) 555-0164",
  sms: "+18175550164",
  email: "hello@fieldstoneandfern.com",
  address: {
    street: "300 Fieldstone Way",
    city: "Southlake",
    region: "TX",
    zip: "76092",
    country: "US",
  },
  geo: { lat: 32.9412, lng: -97.1342 },
  timezone: "America/Chicago",
  founded: 2009,
  rating: { value: 4.9, count: 312 },
  priceRange: "$$–$$$",
  /** Monday = 1 … Sunday = 0. Times are local (America/Chicago), 24h. */
  hours: [
    { days: [1, 2, 3, 4, 5], open: "07:00", close: "18:00" },
    { days: [6], open: "08:00", close: "14:00" },
  ] as { days: number[]; open: string; close: string }[],
  hoursDisplay: [
    { label: "Mon – Fri", value: "7:00 am – 6:00 pm" },
    { label: "Saturday", value: "8:00 am – 2:00 pm" },
    { label: "Sunday", value: "Closed · crews rest" },
  ],
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
  credentials: [
    "ISA Certified Arborist on staff",
    "TCEQ Licensed Irrigator",
    "Fully insured · $2M liability",
    "1-year plant warranty",
    "Water-wise design certified",
    "Background-checked crews",
  ],
} as const;

export const absoluteUrl = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;

export const telHref = `tel:${site.phone}`;
export const smsHref = `sms:${site.sms}`;
export const mailHref = `mailto:${site.email}`;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/lawn-plans", label: "Lawn plans" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;
