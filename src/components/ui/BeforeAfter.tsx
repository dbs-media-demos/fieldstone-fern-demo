"use client";

import { useRef } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { gsap, useGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";

/**
 * Before/after slider. Drag, click, or use the arrow keys (it's an ARIA slider).
 * On first view the handle sweeps once to hint that it moves (not on phones).
 * `onChange` reports the handle position (0–100, share of "before" shown). The handle moves
 * by writing to the DOM, not through React state, so it can update every frame without a
 * cascade of renders.
 */
export function BeforeAfter({
  before,
  after,
  label,
  className,
  sizes = "(min-width: 1024px) 60vw, 100vw",
  onChange,
}: {
  before: string;
  after: string;
  label: string;
  className?: string;
  sizes?: string;
  onChange?: (pos: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  const setPos = (v: number) => {
    pos.current = v;
    if (clip.current) clip.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    const h = handle.current;
    if (h) {
      h.style.left = `${v}%`;
      h.setAttribute("aria-valuenow", String(Math.round(v)));
      h.setAttribute("aria-valuetext", `${Math.round(v)}% before`);
    }
    onChange?.(v);
  };

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
        // A finger may just be starting a scroll: it only moves the handle once it travels sideways, or on a tap.
        const touch = e.pointerType === "touch";
        drag.current = { x: e.clientX, moved: !touch };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        if (!touch) setFromX(e.clientX);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        if (!d.moved && Math.abs(e.clientX - d.x) < 4) return;
        d.moved = true;
        setFromX(e.clientX);
      }}
      onPointerUp={(e) => {
        if (drag.current && !drag.current.moved) setFromX(e.clientX);
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <div className="absolute inset-0">
        <Photo slug={after} sizes={sizes} draggable={false} />
      </div>
      <div ref={clip} className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
        <Photo slug={before} sizes={sizes} draggable={false} className="[filter:saturate(0.8)]" />
      </div>

      <span className="t-eyebrow pointer-events-none absolute left-4 top-4 rounded-full bg-forest/80 px-3 py-2 text-cream backdrop-blur phone:bg-forest phone:backdrop-blur-none">Before</span>
      <span className="t-eyebrow pointer-events-none absolute right-4 top-4 rounded-full bg-cream/90 px-3 py-2 text-forest backdrop-blur phone:bg-cream phone:backdrop-blur-none">After</span>

      <div
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-label={`${label}: before and after comparison`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        aria-valuetext="50% before"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") setPos(Math.max(0, pos.current - 5));
          if (e.key === "ArrowRight" || e.key === "ArrowUp") setPos(Math.min(100, pos.current + 5));
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }}
        className="absolute inset-y-0 z-10 w-11 -translate-x-1/2 cursor-ew-resize focus-visible:outline-none [&:focus-visible>span]:ring-4 [&:focus-visible>span]:ring-lantern"
        style={{ left: "50%" }}
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
