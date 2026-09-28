import Link from "next/link";
import { ViewTransition } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { categories, type Project } from "@/content/projects";
import type { Service } from "@/content/services";

export function ProjectCard({ p, className, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }: { p: Project; className?: string; sizes?: string }) {
  return (
    <Link href={`/projects/${p.slug}`} data-cursor="View" className={clsx("group block", className)}>
      <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] bg-sand">
          <Photo slug={p.hero} sizes={sizes} className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        </div>
      </ViewTransition>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="t-eyebrow text-faint">
            {p.city} · {categories.find((c) => c.id === p.category)?.label} · {p.year}
          </p>
          <h3 className="t-h3 mt-2">{p.title}</h3>
          <p className="mt-2 max-w-md text-muted">{p.summary}</p>
        </div>
        <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:bg-forest group-hover:text-cream">
          <Arrow className="-rotate-45" />
        </span>
      </div>
    </Link>
  );
}

export function ServiceCard({ s, index }: { s: Service; index: number }) {
  return (
    <Link href={`/services/${s.slug}`} data-cursor="Explore" className="group relative block overflow-hidden rounded-[1.75rem]">
      <div className="relative aspect-[4/5] sm:aspect-[5/6]">
        <Photo slug={s.hero} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/30 to-forest/5" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-cream sm:p-8">
        <div className="flex items-center justify-between">
          <span className="t-eyebrow text-lantern">0{index + 1}</span>
          <span className="t-eyebrow rounded-full border border-cream/30 px-3 py-1.5">{s.kind === "recurring" ? "Recurring" : "Project"}</span>
        </div>
        <div>
          <h3 className="t-h3">{s.short}</h3>
          <p className="mt-3 max-w-sm text-cream/80">{s.summary}</p>
          <p className="t-eyebrow mt-5 inline-flex items-center gap-2 text-lantern">
            Learn more <Arrow />
          </p>
        </div>
      </div>
    </Link>
  );
}
