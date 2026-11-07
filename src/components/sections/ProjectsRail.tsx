"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition, type CSSProperties } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { categories } from "@/content/categories";
import type { Project } from "@/content/projects";
import { gsap, useGSAP, isPhone, prefersReducedMotion } from "@/lib/gsap";
import { useBiz } from "@/components/preview/BizContext";

// Flagstone outlines for the stepping-stone path (60 × 34 box)
const STONES = [
  "M6 10Q4 4 14 3L40 2Q52 2 55 10L57 22Q56 31 44 31L14 32Q4 31 4 22Z",
  "M4 14Q6 4 18 4L46 6Q56 8 56 18Q55 29 42 30L16 31Q5 30 4 20Z",
  "M8 6L36 3Q50 3 54 12Q58 24 48 30L20 32Q6 32 4 22Q3 12 8 6Z",
  "M5 12Q8 3 22 4L44 3Q55 5 54 16L52 26Q49 32 36 31L12 30Q3 28 5 12Z",
];
const PATH_LEN = 14;

// Phones group the rail by project type; these are the types with a project, in the order they appear
const kindsOf = (projects: RailProject[]) => categories.map((c) => c.id).filter((id) => projects.some((p) => p.category === id));

/** What a rail card shows: passed from the server, so the projects' full stories stay out of the client bundle. */
export type RailProject = Pick<Project, "slug" | "title" | "city" | "category" | "year" | "hero">;

/**
 * Horizontal project gallery. On desktop the section pins and the rail slides
 * sideways as you scroll; each card's photo counter-drifts for depth.
 * On phones it's a native swipeable rail with scroll-snap, grouped by project type (chips jump to a type).
 * Under the desktop rail, a stepping-stone path is laid stone by stone as you move through it.
 */
export function ProjectsRail({ projects }: { projects: RailProject[] }) {
  const biz = useBiz();
  const railKinds = kindsOf(projects);
  const kindOrder = (id: string) => railKinds.indexOf(id as (typeof railKinds)[number]) + 1;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const swipe = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<string>(railKinds[0] ?? "");

  // Phones: the type chips follow the swipe
  useEffect(() => {
    const el = swipe.current;
    if (!el || !isPhone()) return;
    const onScroll = () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-kind]");
      let at: string | undefined;
      cards.forEach((c) => {
        if (c.offsetLeft - el.offsetLeft <= el.scrollLeft + 60) {
          if (!at || c.offsetLeft > el.querySelector<HTMLElement>(`[data-kind="${at}"]`)!.offsetLeft) at = c.dataset.kind;
        }
      });
      if (at) setKind(at);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (k: string) => {
    const el = swipe.current;
    const card = el?.querySelector<HTMLElement>(`[data-kind="${k}"]`);
    if (!el || !card) return;
    setKind(k);
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;
      const stones = gsap.utils.toArray<HTMLElement>(".rail-stone", root.current);
      root.current?.querySelector(".rail-path")?.setAttribute("data-anim", "");
      const lay = (p: number) => stones.forEach((st, i) => st.classList.toggle("is-laid", i <= Math.round(p * (PATH_LEN - 1))));
      lay(0);

      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => lay(self.progress),
        },
      });
      gsap.utils.toArray<HTMLElement>(".rail-img").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  const label = (id: string) => categories.find((c) => c.id === id)?.label;

  return (
    <div>
      <section ref={root} aria-labelledby="projects-title" className="theme-cream relative overflow-hidden phone:pb-4 phone:pt-7">
        <div className="flex min-h-[100svh] flex-col justify-center py-20 lg:py-0 phone:!min-h-0 phone:!py-0" data-rise>
          <div
            ref={track}
            className="no-scrollbar flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-[var(--gutter)] [@media(hover:hover)_and_(pointer:fine)]:overflow-visible md:gap-8 phone:!block phone:!overflow-visible phone:!px-0"
          >
            <div className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[34vw] phone:!w-auto phone:px-[var(--gutter)]">
              <p className="t-eyebrow text-accent">Selected projects</p>
              <h2 id="projects-title" className="t-h2 mt-5">
                Built in <span className="t-italic">your</span> neighborhood.
              </h2>
              <p className="t-body mt-6 max-w-sm text-muted phone:!mt-2">
                Patios in Timarron, kitchens in Colleyville, a xeriscape in Keller that cut the water bill by 61%. Scroll through a few favorites.
              </p>
              <Link href="/projects" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium phone:hidden">
                All projects <Arrow />
              </Link>
            </div>

            {/* Phones only: jump the gallery to a project type */}
            <div role="toolbar" aria-label="Project type" className="no-scrollbar hidden phone:mt-3 phone:flex phone:gap-1.5 phone:overflow-x-auto phone:px-[var(--gutter)]">
              {railKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => jump(k)}
                  className={clsx("inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm", kind === k ? "border-forest bg-forest text-cream" : "border-line")}
                >
                  {label(k)}
                </button>
              ))}
            </div>

            {/* Desktop: not a box of its own, the cards sit in the track. Phones: the swipe row. */}
            <div ref={swipe} className="contents phone:mt-3 phone:!flex phone-swipe [--card:60vw]">

            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                data-cursor="View"
                data-kind={projects.slice(0, i).some((x) => x.category === p.category) ? undefined : p.category}
                className="group relative block w-[78vw] shrink-0 snap-start sm:w-[52vw] lg:w-[30vw] [margin-top:var(--mt)] phone:[margin-top:0] phone:[order:var(--o)]"
                style={{ "--mt": i % 2 ? "8vh" : "-6vh", "--o": kindOrder(p.category) } as CSSProperties}
              >
                <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] bg-sand phone:!aspect-[8/9]">
                    <div className="rail-img absolute -inset-x-[10%] inset-y-0">
                      <Photo
                        slug={p.hero}
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 55vw, 72vw"
                        className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                      />
                    </div>
                  </div>
                </ViewTransition>
                <div className="mt-5 flex items-start justify-between gap-4 phone:!mt-2.5">
                  <div>
                    <p className="t-eyebrow text-faint phone:!tracking-[0.08em]">
                      {biz.preview ? biz.area : p.city} · {label(p.category)} · {p.year}
                    </p>
                    <h3 className="t-h3 mt-2 phone:!mt-1 phone:!text-[1.12rem]">{p.title}</h3>
                  </div>
                  <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:bg-forest group-hover:text-cream phone:hidden">
                    <Arrow className="-rotate-45" />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href="/projects"
              className="group flex aspect-[4/5] w-[70vw] shrink-0 snap-start flex-col phone:!aspect-auto items-center justify-center gap-4 rounded-t-[999px] rounded-b-[1.5rem] bg-forest text-cream sm:w-[40vw] lg:w-[22vw] phone:[order:9]"
            >
              <span className="font-display text-4xl tracking-[-0.03em]">
                All <span className="t-italic text-lantern">projects</span>
              </span>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lantern text-forest transition-transform duration-500 group-hover:scale-110">
                <Arrow />
              </span>
            </Link>
            <div className="w-px shrink-0 phone:[order:10]" aria-hidden />
            </div>
          </div>
        </div>

        <div aria-hidden className="rail-path pointer-events-none absolute inset-x-[var(--gutter)] bottom-6 flex items-end justify-between lg:bottom-3 phone:!hidden">
          {Array.from({ length: PATH_LEN }, (_, i) => (
            <svg
              key={i}
              viewBox="0 0 60 34"
              className="rail-stone h-auto w-[clamp(18px,3.6vw,48px)]"
              style={{ ["--st-r" as string]: `${((i * 37) % 13) - 6}deg`, marginBottom: i % 2 ? 6 : 0 }}
            >
              <path d={STONES[(i * 3) % STONES.length]} fill={i % 3 ? "#d6c9ad" : "#c9b995"} stroke="#16241c" strokeOpacity={0.14} />
            </svg>
          ))}
        </div>
      </section>
    </div>
  );
}
