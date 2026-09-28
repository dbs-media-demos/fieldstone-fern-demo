import { absoluteUrl, site } from "@/content/site";
import { cities } from "@/content/cities";
import { reviews } from "@/content/misc";

/** schema.org builders. Everything links back to one LandscapingBusiness node via @id. */

type Json = Record<string, unknown>;

export const businessId = `${site.url}/#business`;
export const websiteId = `${site.url}/#website`;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function businessSchema(): Json {
  return {
    "@type": ["LandscapingBusiness", "HomeAndConstructionBusiness"],
    "@id": businessId,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    image: [absoluteUrl("/images/estate-lawn-hedges.jpg"), absoluteUrl("/images/patio-firepit-house.jpg"), absoluteUrl("/images/craftsman-dusk.jpg")],
    description: site.description,
    telephone: site.phone,
    email: site.email,
    priceRange: site.priceRange,
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAY_NAMES[d]),
      opens: h.open,
      closes: h.close,
    })),
    areaServed: cities.map((c) => ({ "@type": "City", name: `${c.name}, TX` })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5 },
    review: reviews.slice(0, 6).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    knowsAbout: ["Lawn care", "Landscape design", "Hardscaping", "Outdoor lighting", "Irrigation", "Xeriscaping", "Tree care"],
    sameAs: Object.values(site.social),
  };
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: site.legalName,
    description: site.description,
    publisher: { "@id": businessId },
    inLanguage: "en-US",
  };
}

export function webPageSchema(opts: { path: string; name: string; description: string; type?: string }): Json {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: "en-US",
    isPartOf: { "@id": websiteId },
    about: { "@id": businessId },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string; serviceType: string; image: string; offers?: string[]; areaName?: string }): Json {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: absoluteUrl(opts.path),
    image: absoluteUrl(`/images/${opts.image}.jpg`),
    provider: { "@id": businessId },
    areaServed: opts.areaName
      ? { "@type": "City", name: opts.areaName }
      : cities.map((c) => ({ "@type": "City", name: `${c.name}, TX` })),
    ...(opts.offers?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: opts.name,
            itemListElement: opts.offers.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o } })),
          },
        }
      : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function itemListSchema(items: { name: string; path: string }[]): Json {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, url: absoluteUrl(item.path) })),
  };
}

export function projectSchema(opts: { name: string; description: string; path: string; image: string; year: number; city: string }): Json {
  return {
    "@type": "CreativeWork",
    "@id": `${absoluteUrl(opts.path)}#project`,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    image: absoluteUrl(`/images/${opts.image}.jpg`),
    dateCreated: String(opts.year),
    locationCreated: { "@type": "Place", name: `${opts.city}, TX` },
    creator: { "@id": businessId },
  };
}

export const graph = (...nodes: Json[]) => ({ "@context": "https://schema.org", "@graph": nodes });
