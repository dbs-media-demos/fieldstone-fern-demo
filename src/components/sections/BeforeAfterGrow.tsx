"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";

const WEEKS = 6;
// leaf positions up the stem: [x, y, side, grows at]
const LEAVES: [number, number, 1 | -1, number][] = [
  [40.5, 76, -1, 0.2],
  [40.5, 66, 1, 0.36],
  [41.5, 52, -1, 0.52],
  [40.5, 40, 1, 0.68],
];

/**
 * Home before/after. Beside the slider a seedling keeps time with it: drag toward
 * "after" and it grows, week by week, from bare soil to a flowering plant.
 */
export function BeforeAfterGrow() {
  // How far along the seedling is. Quantised, so the slider moving every frame doesn't render every frame.
  const [g, setG] = useState(0.5);
  const week = Math.round(g * WEEKS);

  return (
    <section className="theme-sand py-24 sm:py-32" aria-labelledby="ba-title">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center phone:!grid-cols-1 phone:!gap-3">
        <div className="lg:col-span-4 phone:contents">
          <Reveal as="p" className="t-eyebrow text-accent phone:order-1">
            Before · After
          </Reveal>
          <h2 id="ba-title" className="t-h2 mt-5 phone:order-2 phone:!mt-0">
            Same yard. <span className="t-italic">Six</span> weeks.
          </h2>
          <Reveal className="mt-6 space-y-4 text-muted phone:order-5 phone:!mt-0 phone:space-y-2 phone:text-[0.97rem]" delay={0.1}>
            <p>
              The Harmons in Timarron had a fenced rectangle of tired Bermuda. Now they have a flagstone courtyard with a fire pit that&rsquo;s lit every
              evening from October to March.
            </p>
            <p className="text-sm phone:hidden">Drag the handle, or focus it and use your arrow keys.</p>
            <Link href="/projects/southlake-courtyard-patio" className="inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium text-fg phone:!min-h-9">
              See the project <Arrow />
            </Link>
          </Reveal>

          <div aria-hidden className="mt-10 flex items-end gap-4 phone:order-4 phone:!-my-1 phone:!mt-0">
            <svg viewBox="0 0 80 100" className="h-24 w-20 shrink-0 overflow-visible phone:h-16 phone:w-14">
              <ellipse cx={40} cy={93} rx={28} ry={5} fill="var(--forest)" fillOpacity={0.16} />
              <path
                d="M40 92C40 80 38 68 41 56C43 46 40 36 40 26"
                pathLength={1}
                fill="none"
                stroke="var(--fern)"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray={1}
                strokeDashoffset={1 - Math.min(1, g * 1.1)}
                className="transition-[stroke-dashoffset] duration-500 ease-[var(--ease-out-expo)]"
              />
              {LEAVES.map(([x, y, side, at]) => (
                <g key={y} transform={`translate(${x} ${y}) scale(${side} 1)`}>
                  <path d="M0 0Q10 -11 23 -4Q11 4 0 0Z" fill="var(--fern)" className={clsx("ba-leaf", g >= at && "is-on")} />
                </g>
              ))}
              <g transform="translate(40 25)">
                <g className={clsx("ba-bloom", g >= 0.9 && "is-on")}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <ellipse key={i} cx={0} cy={-6} rx={3} ry={6} fill="var(--lantern)" transform={`rotate(${i * 45})`} />
                  ))}
                  <circle r={3.4} fill="var(--terracotta)" />
                </g>
              </g>
            </svg>
            <p className="pb-2">
              <span className="t-eyebrow block text-faint">Install timeline</span>
              <span className="font-display mt-1 block text-3xl leading-none tracking-[-0.03em] tabular-nums phone:text-2xl">
                {week === 0 ? "Day one" : `Week ${week}`}
                <span className="text-faint"> / {WEEKS}</span>
              </span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-8 phone:order-3">
          <BeforeAfter
            before="before-empty-yard"
            after="patio-firepit-house"
            label="Timarron courtyard"
            className="aspect-[4/3] sm:aspect-[16/10] phone:!aspect-[16/10]"
            onChange={(pos) => setG(Math.round((1 - pos / 100) * 50) / 50)}
          />
        </div>
      </div>
    </section>
  );
}
