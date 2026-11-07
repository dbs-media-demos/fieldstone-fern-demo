"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { ServiceGlyph } from "@/components/ui/ServiceGlyph";
import type { Service } from "@/content/services";
import { gsap, ScrollTrigger, useGSAP, isTouch, prefersReducedMotion } from "@/lib/gsap";

/**
 * Big serif service list. On desktop a photo preview floats beside the cursor
 * and cross-fades as you move between rows; on phones each row carries a thumbnail.
 * Each row has a line glyph that acts out its service while the row is live (hovered
 * or focused; on phones, the row crossing the middle of the screen), and the row
 * edges are cut in like a fresh lawn edge, a trimmer head running along each line.
 */
export function ServicesList({ services }: { services: Pick<Service, "slug" | "short" | "summary" | "hero" | "kind">[] }) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [centred, setCentred] = useState<number | null>(null);
  const live = active ?? centred;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>(".svc-row", root.current);

      // Edging: each row line is cut in left to right as it scrolls up.
      rows.forEach((row) => {
        const edge = row.querySelector(".svc-edge");
        const head = row.querySelector(".svc-head");
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: row, start: "top 94%", end: "top 62%", scrub: 0.5 } })
          .fromTo(edge, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          .fromTo(head, { x: 0 }, { x: () => row.offsetWidth - 40, duration: 1 }, 0)
          .fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
          .to(head, { opacity: 0, duration: 0.15 }, 0.85);
      });

      // Phones: the row crossing the middle of the screen is live.
      if (isTouch()) {
        rows.forEach((row, i) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 56%",
            end: "bottom 56%",
            onToggle: (self) => setCentred((c) => (self.isActive ? i : c === i ? null : c)),
          }),
        );
        return;
      }

      const el = preview.current;
      if (!el) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" });
      const rTo = gsap.quickTo(el, "rotate", { duration: 1, ease: "power3" });
      let lastX = 0;
      const move = (e: PointerEvent) => {
        const r = root.current!.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
        rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
        lastX = e.clientX;
      };
      root.current!.addEventListener("pointermove", move);
      return () => root.current?.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative" onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-line phone:grid phone:grid-cols-2 phone:gap-x-3">
        {services.map((s, i) => (
          <li key={s.slug} className="svc-row relative">
            <Link
              href={`/services/${s.slug}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={clsx("group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 sm:gap-8 md:py-8 phone:!flex phone:!min-h-[3.2rem] phone:!py-1.5", live === i && "is-live")}
            >
              <span aria-hidden className="svc-sweep pointer-events-none absolute inset-y-0 -left-[var(--gutter)] -right-[var(--gutter)] -z-10 phone:hidden" />
              <span className="flex w-9 flex-col items-center gap-1.5 md:w-14 phone:hidden">
                <ServiceGlyph
                  slug={s.slug}
                  className="h-9 w-9 text-faint transition-colors duration-500 group-hover:text-fg group-[.is-live]:text-fg md:h-14 md:w-14"
                />
                <span className="t-eyebrow text-[0.62rem] text-faint">0{i + 1}</span>
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-4 phone:gap-2.5">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-t-full rounded-b-md md:hidden phone:!block phone:!h-10 phone:!w-8">
                    <Photo slug={s.hero} sizes="64px" decorative />
                  </span>
                  <span className="font-display block text-[clamp(1.7rem,4.6vw,4.4rem)] leading-[1] tracking-[-0.035em] phone:!text-[1.05rem] phone:!leading-[1.08] phone:!tracking-[-0.015em] transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-accent group-[.is-live]:translate-x-3 group-[.is-live]:text-accent">
                    {s.short}
                  </span>
                </span>
                <span className="mt-3 hidden max-w-2xl text-muted md:block phone:!hidden">{s.summary}</span>
              </span>
              <span className="flex items-center gap-4 phone:hidden">
                <span className="t-eyebrow hidden rounded-full border border-line px-3 py-2 text-muted lg:inline">
                  {s.kind === "recurring" ? "Recurring" : "Project"}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-transparent group-hover:bg-terracotta group-hover:text-cream group-[.is-live]:border-transparent group-[.is-live]:bg-terracotta group-[.is-live]:text-cream">
                  <Arrow className="-rotate-45 transition-transform duration-500 group-hover:rotate-0 group-[.is-live]:rotate-0" />
                </span>
              </span>
            </Link>
            <span aria-hidden className="svc-edge pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-line" />
            <span
              aria-hidden
              className="svc-head pointer-events-none absolute bottom-0 left-0 h-[3px] w-10 translate-y-px rounded-full bg-gradient-to-r from-transparent to-accent opacity-0 phone:hidden"
            />
          </li>
        ))}
      </ul>

      {/* Floating preview (desktop pointer only) */}
      <div
        ref={preview}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute left-0 top-0 z-10 hidden h-[340px] w-[270px] -translate-x-[115%] -translate-y-1/2 overflow-hidden rounded-t-[140px] rounded-b-2xl shadow-2xl shadow-forest/30 transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)] [@media(hover:hover)]:block phone:!hidden",
          active === null ? "scale-75 opacity-0" : "scale-100 opacity-100",
        )}
      >
        {services.map((s, i) => (
          <div
            key={s.slug}
            className={clsx(
              "absolute inset-0 transition-[opacity,transform] duration-700",
              active === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
            )}
          >
            <Photo slug={s.hero} sizes="270px" decorative />
          </div>
        ))}
      </div>
    </div>
  );
}
