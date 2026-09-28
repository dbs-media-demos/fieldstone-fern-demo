"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { processSteps } from "@/content/misc";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Sticky cards that stack as you scroll; the ones underneath settle back and darken. */
export function ProcessStack() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>(".p-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const scrollTrigger = { trigger: cards[i + 1], start: "top 80%", end: "top 25%", scrub: true };
        gsap.fromTo(card.querySelector(".p-inner"), { scale: 1 }, { scale: 0.9 + i * 0.02, ease: "none", scrollTrigger });
        gsap.fromTo(card.querySelector(".p-shade"), { opacity: 0 }, { opacity: 0.55, ease: "none", scrollTrigger });
      });
      gsap.utils.toArray<HTMLElement>(".p-img").forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 1.2 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "top 20%", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {processSteps.map((s, i) => (
        <div key={s.title} className="p-card sticky pb-5" style={{ top: `calc(var(--header-h) + 1rem + ${i * 1.1}rem)` }}>
          <article className="p-inner theme-cream relative grid origin-top overflow-hidden rounded-[2rem] border border-line md:grid-cols-12 lg:min-h-[30rem]">
            <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 md:col-span-7">
              <div className="flex items-start justify-between gap-6">
                <span className="font-display text-[clamp(4.2rem,9vw,8.5rem)] leading-[0.8] tracking-[-0.06em] text-moss">0{i + 1}</span>
                <span className="t-eyebrow rounded-full border border-line px-3 py-2 text-muted">{s.duration}</span>
              </div>
              <div>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-body mt-4 max-w-xl text-muted">{s.text}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="rounded-full bg-forest px-4 py-2 text-sm text-cream">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative min-h-60 overflow-hidden md:col-span-5 md:min-h-0">
              <div className="p-img absolute inset-0">
                <Photo slug={s.img} sizes="(min-width: 768px) 40vw, 100vw" />
              </div>
            </div>
            <div aria-hidden className="p-shade pointer-events-none absolute inset-0 bg-forest opacity-0" />
          </article>
        </div>
      ))}
    </div>
  );
}
