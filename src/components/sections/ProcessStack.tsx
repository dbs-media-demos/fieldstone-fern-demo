"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { processSteps } from "@/content/scenes";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const LEAF = "M0 0Q8 -8 17 -3Q8 3 0 0Z";

/** One growth stage per step: seed (consult), sprout (design), young plant (install), shrub in flower (care). */
function GrowthStage({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-14 w-14 shrink-0 overflow-visible sm:h-20 sm:w-20 phone:!h-10 phone:!w-10" fill="none" stroke="var(--fern)" strokeWidth={2} strokeLinecap="round">
      <path d="M6 56H58" stroke="var(--moss)" strokeOpacity={0.5} />
      {stage === 0 && (
        <>
          <path className="gs-draw" pathLength={1} d="M32 53Q30 57 33 61" strokeWidth={1.4} />
          <ellipse className="gs-pop" cx={32} cy={50} rx={4.5} ry={3.2} fill="var(--moss)" stroke="none" />
        </>
      )}
      {stage === 1 && (
        <>
          <path className="gs-draw" pathLength={1} d="M32 56Q30 47 32 40" />
          <path className="gs-pop" d="M32 40Q24 32 18 37Q25 44 32 40Z" fill="var(--fern)" stroke="none" />
          <path className="gs-pop" d="M32 40Q40 32 46 37Q39 44 32 40Z" fill="var(--fern)" stroke="none" />
        </>
      )}
      {stage === 2 && (
        <>
          <path className="gs-draw" pathLength={1} d="M32 56C31 44 34 34 32 20" />
          {(
            [
              [32, 46, -1],
              [32.5, 38, 1],
              [33, 30, -1],
              [32.5, 23, 1],
            ] as const
          ).map(([x, y, sd]) => (
            <g key={y} transform={`translate(${x} ${y}) scale(${sd} 1)`}>
              <path className="gs-pop" d={LEAF} fill="var(--fern)" stroke="none" />
            </g>
          ))}
        </>
      )}
      {stage === 3 && (
        <>
          <path className="gs-draw" pathLength={1} d="M32 56V40M32 46L24 38M32 44L40 36" />
          <circle className="gs-pop" cx={32} cy={28} r={15} fill="var(--fern)" stroke="none" />
          <circle className="gs-pop" cx={21} cy={34} r={9} fill="color-mix(in oklab, var(--fern) 80%, var(--moss))" stroke="none" />
          <circle className="gs-pop" cx={43} cy={34} r={9} fill="color-mix(in oklab, var(--fern) 80%, var(--moss))" stroke="none" />
          <circle className="gs-pop" cx={26} cy={22} r={2.6} fill="var(--lantern)" stroke="none" />
          <circle className="gs-pop" cx={38} cy={27} r={2.6} fill="var(--lantern)" stroke="none" />
          <circle className="gs-pop" cx={44} cy={36} r={2.6} fill="var(--terracotta-2)" stroke="none" />
        </>
      )}
    </svg>
  );
}

/**
 * Sticky cards that stack as you scroll; the ones underneath settle back and darken.
 * A plant grows through the steps: each card's stage draws itself in as the card arrives.
 */
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
      cards.forEach((card) => {
        const draw = card.querySelectorAll(".gs-draw");
        const pop = card.querySelectorAll(".gs-pop");
        gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(pop, { scale: 0, transformOrigin: "50% 100%" });
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 72%", toggleActions: "play none none none" } })
          .to(draw, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" })
          .to(pop, { scale: 1, duration: 0.7, stagger: 0.08, ease: "back.out(2)" }, 0.45);
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
    <div ref={root} className="phone-swipe [--card:84vw]">
      {processSteps.map((s, i) => (
        <div key={s.title} className="p-card sticky pb-5 phone:!static phone:pb-0" style={{ top: `calc(var(--header-h) + 1rem + ${i * 1.1}rem)` }}>
          <article className="p-inner theme-cream relative grid origin-top overflow-hidden rounded-[2rem] border border-line md:grid-cols-12 lg:min-h-[30rem] phone:!flex phone:!min-h-0 phone:h-full phone:flex-col phone:rounded-[1.25rem]">
            <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 md:col-span-7 phone:!justify-start phone:!gap-3 phone:!p-4">
              <div className="flex items-start justify-between gap-6">
                <span className="flex items-end gap-2 sm:gap-4">
                  <span className="font-display text-[clamp(4.2rem,9vw,8.5rem)] leading-[0.8] tracking-[-0.06em] text-moss phone:!text-[2.6rem]">0{i + 1}</span>
                  <GrowthStage stage={Math.min(i, 3)} />
                </span>
                <span className="t-eyebrow rounded-full border border-line px-3 py-2 text-muted">{s.duration}</span>
              </div>
              <div>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-body mt-4 max-w-xl text-muted phone:!mt-1.5 phone:!text-[0.92rem] phone:!leading-snug">{s.text}</p>
                <ul className="mt-6 flex flex-wrap gap-2 phone:!mt-2.5 phone:!gap-1">
                  {s.deliverables.map((d) => (
                    <li key={d} className="rounded-full bg-forest px-4 py-2 text-sm text-cream phone:!px-2.5 phone:!py-1 phone:!text-xs">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative min-h-60 overflow-hidden md:col-span-5 md:min-h-0 phone:!mt-auto phone:!h-20 phone:!min-h-0 phone:shrink-0">
              <div className="p-img absolute inset-0">
                <Photo slug={s.img} sizes="(min-width: 768px) 40vw, 80vw" />
              </div>
            </div>
            <div aria-hidden className="p-shade pointer-events-none absolute inset-0 bg-forest opacity-0" />
          </article>
        </div>
      ))}
    </div>
  );
}
