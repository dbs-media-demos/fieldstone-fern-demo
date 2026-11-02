"use client";

import { useId, useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const W = 1200;
const TOP = 26; // neat hedge top line

// Overgrown top edge: deterministic bumps and stray sprigs above the clipped line
const SHAGGY = (() => {
  let d = `M0 80V${TOP}`;
  for (let x = 0, i = 0; x < W; x += 16, i++) {
    const h = TOP - 6 - (Math.sin(i * 12.9898) * 43758.5453 - Math.floor(Math.sin(i * 12.9898) * 43758.5453)) * 16;
    d += ` Q${x + 8} ${h.toFixed(1)} ${x + 16} ${(TOP - 4).toFixed(1)}`;
  }
  return `${d} V80Z`;
})();

/**
 * A hedge along the foot of the closing band: overgrown at first, then trimmed into a
 * crisp box as it scrolls into view, a hedge trimmer working left to right along the top.
 * Server render / reduced motion: the neat hedge.
 */
export function HedgeTrim({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const neat = el.querySelector(`#neat-${id} rect`);
      const wild = el.querySelector(`#wild-${id} rect`);
      const trimmer = el.querySelector(".hg-trimmer");
      const cut = { x: 0 };
      const apply = () => {
        neat?.setAttribute("width", String(cut.x));
        wild?.setAttribute("x", String(cut.x));
        gsap.set(trimmer, { left: `${(cut.x / W) * 100}%`, opacity: cut.x > 4 && cut.x < W - 4 ? 1 : 0 });
      };
      apply();
      gsap.to(cut, { x: W, ease: "none", onUpdate: apply, scrollTrigger: { trigger: el, start: "top 98%", end: "top 52%", scrub: 0.6 } });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className={clsx("pointer-events-none", className)}>
      <svg viewBox={`0 0 ${W} 80`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <clipPath id={`neat-${id}`}>
            <rect x={0} y={0} width={W} height={80} />
          </clipPath>
          <clipPath id={`wild-${id}`}>
            <rect x={W} y={0} width={W} height={80} />
          </clipPath>
        </defs>
        <g clipPath={`url(#wild-${id})`}>
          <path d={SHAGGY} fill="#3d5a38" />
        </g>
        <g clipPath={`url(#neat-${id})`}>
          <rect x={0} y={TOP} width={W} height={80 - TOP} fill="#2a4230" />
          <rect x={0} y={TOP} width={W} height={5} fill="#4f6d45" />
        </g>
      </svg>
      <svg viewBox="0 0 44 20" className="hg-trimmer absolute top-0 h-5 w-11 -translate-x-1/2 -translate-y-1/3 -scale-x-100 opacity-0 sm:h-6 sm:w-14">
        <rect x={0} y={8} width={30} height={3} rx={1} fill="#e2d5bc" />
        <path d="M2 8V6M6 8V6M10 8V6M14 8V6M18 8V6M22 8V6M26 8V6" stroke="#e2d5bc" strokeWidth={1.2} />
        <rect x={28} y={5} width={14} height={9} rx={3} fill="#a3472c" />
      </svg>
    </div>
  );
}
