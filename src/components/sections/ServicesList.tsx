"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { services } from "@/content/services";
import { gsap, useGSAP, isTouch, prefersReducedMotion } from "@/lib/gsap";

/**
 * Big serif service list. On desktop a photo preview floats beside the cursor
 * and cross-fades as you move between rows; on phones each row carries a thumbnail.
 */
export function ServicesList() {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const el = preview.current;
      if (!el || isTouch() || prefersReducedMotion()) return;
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
      <ul className="border-t border-line">
        {services.map((s, i) => (
          <li key={s.slug} className="border-b border-line">
            <Link
              href={`/services/${s.slug}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 sm:gap-8 md:py-8"
            >
              <span className="t-eyebrow w-8 text-faint">0{i + 1}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-4">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-t-full rounded-b-md md:hidden">
                    <Photo slug={s.hero} sizes="64px" decorative />
                  </span>
                  <span className="font-display block text-[clamp(1.7rem,4.6vw,4.4rem)] leading-[1] tracking-[-0.035em] transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-accent">
                    {s.short}
                  </span>
                </span>
                <span className="mt-3 hidden max-w-2xl text-muted md:block">{s.summary}</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="t-eyebrow hidden rounded-full border border-line px-3 py-2 text-muted lg:inline">
                  {s.kind === "recurring" ? "Recurring" : "Project"}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-transparent group-hover:bg-terracotta group-hover:text-cream">
                  <Arrow className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating preview (desktop pointer only) */}
      <div
        ref={preview}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute left-0 top-0 z-10 hidden h-[340px] w-[270px] -translate-x-[115%] -translate-y-1/2 overflow-hidden rounded-t-[140px] rounded-b-2xl shadow-2xl shadow-forest/30 transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)] [@media(hover:hover)]:block",
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
