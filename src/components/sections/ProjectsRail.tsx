"use client";

import Link from "next/link";
import { useRef, ViewTransition } from "react";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { projects, categories } from "@/content/projects";
import { gsap, useGSAP, prefersReducedMotion, isTouch } from "@/lib/gsap";

/**
 * Horizontal project gallery. On desktop the section pins and the rail slides
 * sideways as you scroll; each card's photo counter-drifts for depth.
 * On touch it's a native swipeable rail with scroll-snap.
 */
export function ProjectsRail() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion() || isTouch()) return;
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
      <section ref={root} aria-labelledby="projects-title" className="theme-cream relative overflow-hidden">
        <div className="flex min-h-[100svh] flex-col justify-center py-20 lg:py-0">
          <div
            ref={track}
            className="no-scrollbar flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-[var(--gutter)] [@media(hover:hover)_and_(pointer:fine)]:overflow-visible md:gap-8"
          >
            <div className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[34vw]">
              <p className="t-eyebrow text-accent">Selected projects</p>
              <h2 id="projects-title" className="t-h2 mt-5">
                Built in <span className="t-italic">your</span> neighborhood.
              </h2>
              <p className="t-body mt-6 max-w-sm text-muted">
                Patios in Timarron, kitchens in Colleyville, a xeriscape in Keller that cut the water bill by 61%. Scroll through a few favorites.
              </p>
              <Link href="/projects" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium">
                All projects <Arrow />
              </Link>
            </div>

            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                data-cursor="View"
                className="group relative block w-[78vw] shrink-0 snap-start sm:w-[52vw] lg:w-[30vw]"
                style={{ marginTop: i % 2 ? "8vh" : "-6vh" }}
              >
                <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] bg-sand">
                    <div className="rail-img absolute -inset-x-[10%] inset-y-0">
                      <Photo
                        slug={p.hero}
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 55vw, 80vw"
                        className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                      />
                    </div>
                  </div>
                </ViewTransition>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="t-eyebrow text-faint">
                      {p.city} · {label(p.category)} · {p.year}
                    </p>
                    <h3 className="t-h3 mt-2">{p.title}</h3>
                  </div>
                  <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:bg-forest group-hover:text-cream">
                    <Arrow className="-rotate-45" />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href="/projects"
              className="group flex aspect-[4/5] w-[70vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-t-[999px] rounded-b-[1.5rem] bg-forest text-cream sm:w-[40vw] lg:w-[22vw]"
            >
              <span className="font-display text-4xl tracking-[-0.03em]">
                All <span className="t-italic text-lantern">projects</span>
              </span>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lantern text-forest transition-transform duration-500 group-hover:scale-110">
                <Arrow />
              </span>
            </Link>
            <div className="w-px shrink-0" aria-hidden />
          </div>
        </div>
      </section>
    </div>
  );
}
