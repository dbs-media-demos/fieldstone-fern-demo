import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/content/site";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { cities } from "@/content/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-28");
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly", images?: string[]) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
    ...(images ? { images: images.map((i) => absoluteUrl(`/images/${i}.jpg`)) } : {}),
  });
  return [
    page("/", 1, "weekly", ["estate-lawn-hedges", "patio-firepit-house", "night-reveal"]),
    page("/services", 0.9),
    ...services.map((s) => page(`/services/${s.slug}`, 0.9, "monthly", [s.hero])),
    page("/projects", 0.8, "weekly"),
    ...projects.map((p) => page(`/projects/${p.slug}`, 0.7, "yearly", [p.hero, ...p.gallery.slice(0, 3)])),
    page("/lawn-plans", 0.9),
    page("/service-areas", 0.8),
    ...cities.map((c) => page(`/service-areas/${c.slug}`, 0.8, "monthly", [c.hero])),
    page("/about", 0.6),
    page("/reviews", 0.6, "weekly"),
    page("/faq", 0.6),
    page("/free-estimate", 0.8),
    page("/contact", 0.7),
    page("/privacy", 0.2, "yearly"),
  ];
}
