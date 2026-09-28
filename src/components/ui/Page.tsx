import { ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";

/** Wraps each page so route changes play the arch-rise transition. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <main id="main">{children}</main>
    </ViewTransition>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Breadcrumbs({ items, className }: { items: { name: string; path: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="opacity-50">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="opacity-80">
                {it.name}
              </span>
            ) : (
              <Link href={it.path} className="inline-flex min-h-8 items-center opacity-70 underline-offset-4 hover:underline hover:opacity-100">
                {it.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Inner-page hero: full-bleed photo that rises in through an arch,
 * with a big serif title. CSS-only intro so it paints immediately.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  crumbs,
  children,
  tall = false,
  vtName,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  image: string;
  crumbs: { name: string; path: string }[];
  children?: ReactNode;
  tall?: boolean;
  vtName?: string;
}) {
  const img = (
    <div className="absolute inset-0">
      <Photo slug={image} sizes="100vw" preload quality={60} />
    </div>
  );
  return (
    <section className={clsx("theme-forest relative isolate flex items-end overflow-hidden", tall ? "min-h-[100svh]" : "min-h-[82svh]")}>
      <div className="anim-arch absolute inset-0 -z-10 origin-bottom">
        {vtName ? (
          <ViewTransition name={vtName} share="morph" default="none">
            {img}
          </ViewTransition>
        ) : (
          img
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/45 to-forest/25" />
      </div>
      <div className="wrap relative pb-14 pt-[calc(var(--header-h)+4rem)] sm:pb-20">
        <Breadcrumbs items={crumbs} className="anim-fade mb-8 text-cream" />
        <p className="t-eyebrow anim-fade text-lantern" style={{ ["--d" as string]: "0.1s" }}>
          {eyebrow}
        </p>
        <SplitReveal as="h1" immediate delay={0.15} className="t-h1 mt-5 max-w-[16ch] text-cream">
          {title}
        </SplitReveal>
        {lead && (
          <Reveal immediate delay={0.35} className="t-lead mt-7 max-w-2xl text-cream/85">
            {lead}
          </Reveal>
        )}
        {children && (
          <Reveal immediate delay={0.5} className="mt-9">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Section heading block: eyebrow + serif headline + optional aside. */
export function SectionHead({
  eyebrow,
  title,
  aside,
  className,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={clsx("grid gap-8 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-8">
        <Reveal as="p" className="t-eyebrow text-accent">
          {eyebrow}
        </Reveal>
        <SplitReveal id={id} className="t-h2 mt-5 max-w-[18ch]">
          {title}
        </SplitReveal>
      </div>
      {aside && (
        <Reveal className="t-body text-muted lg:col-span-4" delay={0.1}>
          {aside}
        </Reveal>
      )}
    </div>
  );
}
