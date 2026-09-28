"use client";

import Link from "next/link";
import { startTransition, useEffect, useLayoutEffect, useRef, useState, ViewTransition } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { categories, gallery, projects, type Category } from "@/content/projects";
import { alt as altFor } from "@/content/images";
import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Flip is only needed here, so it stays out of the shared bundle.
if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Filter = Category | "all";

/**
 * Signature #3 (index): filterable masonry. Filters re-flow with GSAP Flip;
 * opening a photo morphs it into a lightbox with a shared-element ViewTransition.
 */
export function ProjectGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const visible = gallery.map((g) => filter === "all" || g.category === filter);
  const visibleIdx = gallery.map((_, i) => i).filter((i) => visible[i]);

  const choose = (f: Filter) => {
    if (f === filter) return;
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll("li"));
    setFilter(f);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !grid.current) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.8,
      ease: "expo.inOut",
      absolute: true,
      stagger: 0.012,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out", delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
    });
  }, [filter]);

  // Opening/closing morphs through a ViewTransition; paging inside the lightbox just swaps.
  const show = (i: number | null) => {
    startTransition(() => setOpen(i));
  };
  const page = (i: number) => setOpen(i);

  useEffect(() => {
    if (open === null) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      const pos = visibleIdx.indexOf(open);
      if (e.key === "Escape") show(null);
      if (e.key === "ArrowRight") page(visibleIdx[(pos + 1) % visibleIdx.length]);
      if (e.key === "ArrowLeft") page(visibleIdx[(pos - 1 + visibleIdx.length) % visibleIdx.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open, visibleIdx]);

  useEffect(() => {
    if (open === null) lastFocus.current?.focus({ preventScroll: true });
  }, [open]);

  const item = open !== null ? gallery[open] : null;
  const proj = item?.project ? projects.find((p) => p.slug === item.project) : undefined;
  const count = (f: Filter) => (f === "all" ? gallery.length : gallery.filter((g) => g.category === f).length);

  return (
    <>
      <div role="toolbar" aria-label="Filter projects" className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2">
        {(["all", ...categories.map((c) => c.id)] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => choose(f)}
            className={clsx(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 transition-colors duration-300",
              filter === f ? "border-forest bg-forest text-cream" : "border-line hover:border-forest/40",
            )}
          >
            {f === "all" ? "All work" : categories.find((c) => c.id === f)!.label}
            <span className={clsx("t-eyebrow", filter === f ? "text-lantern" : "text-faint")}>{count(f)}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visibleIdx.length} photos
      </p>

      <ul ref={grid} className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
        {gallery.map((g, i) => {
          const tall = i % 5 === 1 || i % 7 === 3;
          const img = (
            <div className={clsx("relative overflow-hidden rounded-[1.25rem] bg-sand", tall ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-[4/3]" : "aspect-square")}>
              <Photo slug={g.img} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
            </div>
          );
          return (
            <li key={g.id} className={clsx("break-inside-avoid", !visible[i] && "hidden")}>
              <button
                type="button"
                data-cursor="Open"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  show(i);
                }}
                className="group block w-full text-left"
                aria-label={`Open photo: ${g.caption}`}
              >
                {open === i ? img : <ViewTransition name={`gal-${g.id}`} share="morph" default="none">{img}</ViewTransition>}
                <span className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
                  <span>{g.caption}</span>
                  <span className="t-eyebrow text-faint">{categories.find((c) => c.id === g.category)?.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {item && open !== null && (
        <div role="dialog" aria-modal="true" aria-label={item.caption} className="fixed inset-0 z-[70] flex flex-col bg-forest/96 text-cream backdrop-blur" data-lenis-prevent>
          <div className="wrap flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <p className="t-eyebrow text-lantern">
              {visibleIdx.indexOf(open) + 1} / {visibleIdx.length}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => show(null)}
              className="inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-cream/30 px-4"
              aria-label="Close"
            >
              Close <span aria-hidden>×</span>
            </button>
          </div>
          <div className="relative min-h-0 flex-1 px-[var(--gutter)]">
            <ViewTransition key={item.id} name={`gal-${item.id}`} share="morph" default="none">
              <div className="relative h-full w-full">
                <Photo slug={item.img} sizes="100vw" alt={altFor(item.img)} className="!object-contain" quality={85} />
              </div>
            </ViewTransition>
          </div>
          <div className="wrap flex shrink-0 flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">{item.caption}</p>
              {proj && (
                <Link href={`/projects/${proj.slug}`} className="mt-1 inline-flex min-h-10 items-center gap-2 text-lantern underline-offset-4 hover:underline">
                  View the {proj.title} project <Arrow />
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => page(visibleIdx[(visibleIdx.indexOf(open) - 1 + visibleIdx.length) % visibleIdx.length])}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cream/30"
              >
                <Arrow className="rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => page(visibleIdx[(visibleIdx.indexOf(open) + 1) % visibleIdx.length])}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cream/30"
              >
                <Arrow />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
