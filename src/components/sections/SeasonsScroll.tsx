"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Photo } from "@/components/ui/Photo";
import { seasons } from "@/content/scenes";
import { isPhone, loadMotion, prefersReducedMotion } from "@/lib/gsap";

/**
 * Signature #1: Spring → Winter. On desktop a pinned scene takes over once it has loaded (SeasonsPinned).
 *
 * Server render / reduced motion: four stacked, fully visible panels. Phones: the same panels
 * as a row of cards to swipe through.
 */
export function SeasonsScroll() {
  const [Pinned, setPinned] = useState<ComponentType | null>(null);

  useEffect(() => {
    // Upgrade to the scroll scene only where motion is allowed; the panels stay until it's ready
    if (prefersReducedMotion() || isPhone()) return;
    void Promise.all([import("./SeasonsPinned"), loadMotion()]).then(([m]) => setPinned(() => m.PinnedSeasons));
  }, []);

  // Stable wrapper: GSAP pinning inserts a spacer around the section, which must stay out of React's way.
  return <div>{Pinned ? <Pinned /> : <StaticSeasons />}</div>;
}

function StaticSeasons() {
  return (
    <section aria-labelledby="seasons-title" className="theme-forest phone:py-8">
      <div data-rise>
        <div className="wrap hidden phone:block">
          <p className="t-eyebrow text-lantern">Four seasons · one crew</p>
          <p className="font-display mt-2 text-[1.45rem] leading-[1.12] tracking-[-0.02em] text-cream">Your yard changes every season. So does what we do in it.</p>
        </div>
        <h2 id="seasons-title" className="sr-only">
          Four seasons, one crew
        </h2>
        <div className="phone-swipe phone:mt-4 [--card:76vw]">
          {seasons.map((s) => (
            <article key={s.id} className="relative isolate flex min-h-[80svh] items-end overflow-hidden phone:min-h-0 phone:rounded-[1.25rem]">
              <div className="absolute inset-0 -z-10">
                <Photo slug={s.img} sizes="(max-width: 767px) 76vw, 100vw" alt={`${s.name} in a North Texas garden`} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${s.tint}55, ${s.tint}ee)` }} />
              </div>
              <div className="wrap grid gap-8 py-16 lg:grid-cols-2 lg:items-end phone:!block phone:!py-4">
                <div>
                  <p className="t-eyebrow" style={{ color: s.accent }}>
                    {s.months}
                  </p>
                  <h3 className="season-name t-mega t-italic mt-3" style={{ color: s.accent }}>
                    {s.name}
                  </h3>
                  <p className="t-lead mt-5 max-w-md text-cream/90 phone:mt-2">{s.line}</p>
                </div>
                <ul className="space-y-3 text-lg text-cream phone:mt-2 phone:space-y-0.5 phone:text-[0.82rem]">
                  {s.services.map((x) => (
                    <li key={x} className="border-b border-cream/20 pb-3 phone:pb-0.5">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
