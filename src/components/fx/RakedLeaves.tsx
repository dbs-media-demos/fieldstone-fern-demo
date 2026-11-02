"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const LEAF = "M0 0C3 -5 9 -6 12 -2C9 2 4 3 0 0ZM0 0L-3 1.5";
const COLORS = ["var(--lantern)", "var(--terracotta-2)", "var(--moss)", "#c98a3b"];
// [pile x, pile y, pile angle, scattered x, scattered y, scattered angle]
const LEAVES = [
  [36, 60, -20, 70, 60, 40],
  [48, 60, 15, 104, 59, -30],
  [42, 55, 60, 132, 61, 80],
  [56, 58, -45, 156, 58, 10],
  [30, 57, 110, 180, 60, -60],
  [46, 51, -70, 196, 57, 130],
  [40, 50, 30, 120, 56, 170],
];

/**
 * A little autumn chore beside the reviews link: scattered leaves get raked into a
 * neat pile once, when it scrolls into view. Server render / reduced motion: the pile.
 */
export function RakedLeaves({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const leaves = gsap.utils.toArray<SVGGElement>(".rk-leaf", el);
      const rake = el.querySelector(".rk-rake");
      leaves.forEach((leaf, i) => {
        const [, , , sx, sy, sa] = LEAVES[i];
        gsap.set(leaf, { x: sx, y: sy, rotation: sa });
      });
      gsap.set(rake, { x: 200, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
      tl.to(rake, { opacity: 1, duration: 0.3 }, 0).to(rake, { x: 0, duration: 1.7, ease: "power1.inOut" }, 0);
      leaves.forEach((leaf, i) => {
        // each leaf goes when the rake's tines reach it
        const when = 0.15 + ((200 - (LEAVES[i][3] - 40)) / 200) * 1.45;
        const [px, py, pa] = LEAVES[i];
        tl.to(leaf, { x: px, y: py, rotation: pa, duration: 0.55, ease: "power2.out" }, Math.max(0.1, when));
      });
      tl.to(rake, { y: -14, rotation: -8, opacity: 0, duration: 0.6, ease: "power2.in" }, ">0.1");
    },
    { scope: root },
  );

  return (
    <svg ref={root} viewBox="0 0 220 70" aria-hidden className={clsx("overflow-visible", className)}>
      <path d="M4 64H216" stroke="var(--fg)" strokeOpacity={0.18} strokeLinecap="round" />
      {LEAVES.map(([x, y, a], i) => (
        <g key={i} className="rk-leaf" transform={`translate(${x} ${y}) rotate(${a}) scale(1.6)`}>
          <path d={LEAF} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} strokeWidth={0.8} strokeLinecap="round" />
        </g>
      ))}
      <g className="rk-rake" fill="none" stroke="var(--fg)" strokeOpacity={0.7} strokeWidth={1.6} strokeLinecap="round">
        <path d="M66 62L118 6" />
        <path d="M58 58L74 66M58 58L56 64M62 60L60 66M66 62L64 68M70 64L68 69" />
      </g>
    </svg>
  );
}
