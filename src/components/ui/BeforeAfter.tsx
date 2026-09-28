"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { gsap, useGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";

/**
 * Before/after slider. Drag, click, or use the arrow keys (it's an ARIA slider).
 * On first view the handle sweeps once to hint that it moves.
 */
export function BeforeAfter({
  before,
  after,
  label,
  className,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
  before: string;
  after: string;
  label: string;
  className?: string;
  sizes?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const r = root.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion() || !belowFold(el)) return;
      const o = { v: 50 };
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        .to(o, { v: 78, duration: 0.9, ease: "power2.inOut", onUpdate: () => setPos(o.v) })
        .to(o, { v: 22, duration: 1.1, ease: "power2.inOut", onUpdate: () => setPos(o.v) })
        .to(o, { v: 50, duration: 0.9, ease: "power3.out", onUpdate: () => setPos(o.v) });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={clsx("relative isolate select-none overflow-hidden rounded-[1.5rem] bg-sand touch-pan-y", className)}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="absolute inset-0">
        <Photo slug={after} sizes={sizes} draggable={false} />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Photo slug={before} sizes={sizes} draggable={false} className="[filter:saturate(0.8)]" />
      </div>

      <span className="t-eyebrow pointer-events-none absolute left-4 top-4 rounded-full bg-forest/80 px-3 py-2 text-cream backdrop-blur">Before</span>
      <span className="t-eyebrow pointer-events-none absolute right-4 top-4 rounded-full bg-cream/90 px-3 py-2 text-forest backdrop-blur">After</span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`${label}: before and after comparison`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") setPos((p) => Math.max(0, p - 5));
          if (e.key === "ArrowRight" || e.key === "ArrowUp") setPos((p) => Math.min(100, p + 5));
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }}
        className="absolute inset-y-0 z-10 w-11 -translate-x-1/2 cursor-ew-resize focus-visible:outline-none [&:focus-visible>span]:ring-4 [&:focus-visible>span]:ring-lantern"
        style={{ left: `${pos}%` }}
      >
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-cream shadow-[0_0_12px_rgba(0,0,0,0.3)]" />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-forest shadow-xl"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
