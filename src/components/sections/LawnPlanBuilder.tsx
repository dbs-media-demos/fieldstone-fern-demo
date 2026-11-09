"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { acresLabel, estimate, frequencies, planServices, yard, type Frequency, type PlanServiceId } from "@/content/pricing";
import { gsap, hasMotion, prefersReducedMotion, rafTween } from "@/lib/gsap";
import { after3DGate } from "@/lib/three-gate";
import type { Yard, YardLayer } from "@/components/fx/lawn3d/YardScene";

/** Thousands separators without Intl (cheap during hydration). */
const commas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Which still layers (rendered from the 3D yard) show for the chosen services, bottom to top. */
const LAYERS: { id: YardLayer; when: (on: (s: PlanServiceId) => boolean) => boolean }[] = [
  { id: "base", when: () => true },
  { id: "mow", when: (on) => on("mowing") },
  { id: "edgeRagged", when: (on) => !on("edging") },
  { id: "edgeClean", when: (on) => on("edging") },
  { id: "weeds", when: (on) => !on("weeds") },
  { id: "fert", when: (on) => on("fertilization") },
  { id: "hedgeWild", when: (on) => !on("hedges") },
  { id: "hedgeClipped", when: (on) => on("hedges") },
];

/**
 * The yard: a 3D scale model of a house on its lot (three.js, desktop only, behind the 3D gate)
 * that the controls act on. The server HTML, phones and anything that fails the gate get the
 * same model as still layers rendered from the scene, cross-faded as services are toggled.
 */
function YardView({ sqft, selected, weekly }: { sqft: number; selected: PlanServiceId[]; weekly: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const yardRef = useRef<Yard | null>(null);
  const [live, setLive] = useState(false);
  const on = (s: PlanServiceId) => selected.includes(s);
  const size = (sqft - yard.min) / (yard.max - yard.min);
  const state = {
    size,
    mowing: on("mowing"),
    edging: on("edging"),
    fertilization: on("fertilization"),
    weeds: on("weeds"),
    hedges: on("hedges"),
    weekly,
  };
  const stateRef = useRef(state);

  useEffect(() => {
    let disposed = false;
    let detach = () => {};
    let near: IntersectionObserver | null = null;
    const create = async () => {
      const { createYard } = await import("@/components/fx/lawn3d/YardScene");
      const cv = canvas.current;
      const host = box.current;
      if (disposed || !cv || !host) return;
      let y: Yard;
      try {
        y = createYard(cv);
      } catch {
        return; // no WebGL after all: the stills stay
      }
      yardRef.current = y;
      y.set(stateRef.current);
      requestAnimationFrame(() => !disposed && setLive(true));
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        y.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
      };
      const onLeave = () => y.clearPointer();
      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = host.getBoundingClientRect();
          y.setScroll(Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height))));
        });
      };
      const io = new IntersectionObserver(([en]) => y.setVisible(en.isIntersecting), { rootMargin: "120px" });
      const ro = new ResizeObserver(() => y.resize());
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      io.observe(host);
      ro.observe(cv);
      onScroll();
      detach = () => {
        cancelAnimationFrame(frame);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("scroll", onScroll);
        io.disconnect();
        ro.disconnect();
      };
    };
    // past the gate, build the model only once the builder is about a screen away
    const cancel = after3DGate(() => {
      if (disposed || !box.current) return;
      near = new IntersectionObserver(
        ([en]) => {
          if (!en.isIntersecting) return;
          near?.disconnect();
          void create();
        },
        { rootMargin: "100% 0px" },
      );
      near.observe(box.current);
    });
    return () => {
      disposed = true;
      cancel();
      near?.disconnect();
      detach();
      yardRef.current?.dispose();
      yardRef.current = null;
    };
  }, []);

  useEffect(() => {
    stateRef.current = state;
    yardRef.current?.set(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the primitive fields are the dependencies
  }, [size, state.mowing, state.edging, state.fertilization, state.weeds, state.hedges, weekly]);

  return (
    <div ref={box} className="yard-view relative aspect-[4/3] w-full phone:aspect-[16/11]">
      <div className={clsx("absolute inset-0 transition-opacity duration-700", live && "opacity-0")}>
        {LAYERS.map((l) => (
          <picture key={l.id}>
            <source type="image/avif" srcSet={`/images/3d/yard/${l.id}.avif`} />
            {/* transparent layers rendered from the 3D yard, stacked and cross-faded (next/image would only re-encode them) */}
            <img
              src={`/images/3d/yard/${l.id}.webp`}
              alt=""
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className={clsx("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", !l.when(on) && "opacity-0")}
            />
          </picture>
        ))}
      </div>
      <canvas ref={canvas} aria-hidden className={clsx("absolute inset-0 hidden h-full w-full transition-opacity duration-700 lg:block", live ? "opacity-100" : "opacity-0")} />
    </div>
  );
}

/**
 * Signature #2: lawn-plan builder. Yard size, services and frequency update a
 * 3D model of the yard (stills on phones) and an animated monthly estimate.
 */
export function LawnPlanBuilder({ compact = false }: { compact?: boolean }) {
  const [sqft, setSqft] = useState(yard.default);
  const [selected, setSelected] = useState<PlanServiceId[]>(planServices.filter((s) => s.defaultOn).map((s) => s.id));
  const [freq, setFreq] = useState<Frequency>("weekly");
  const priceEl = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);
  const id = useId();

  const est = useMemo(() => estimate(sqft, selected, freq), [sqft, selected, freq]);
  const on = (s: PlanServiceId) => selected.includes(s);
  const toggle = (s: PlanServiceId) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  // Animated price counter.
  useEffect(() => {
    const el = priceEl.current;
    if (!el) return;
    const from = shown.current ?? est.monthly;
    shown.current = est.monthly;
    if (prefersReducedMotion() || from === est.monthly) {
      el.textContent = `$${commas(est.monthly)}`;
      return;
    }
    const paint = (n: number) => {
      el.textContent = `$${commas(n)}`;
    };
    if (!hasMotion()) return rafTween(0.5, (t) => paint(from + (est.monthly - from) * t));
    const obj = { n: from };
    const tw = gsap.to(obj, {
      n: est.monthly,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => paint(obj.n),
    });
    return () => {
      tw.kill();
    };
  }, [est.monthly]);

  // Lawn grows from the house as the yard gets bigger.
  const t = (sqft - yard.min) / (yard.max - yard.min);
  const fill = `${(t * 100).toFixed(1)}%`;
  const sqftLabel = commas(sqft);

  const quoteHref = `/free-estimate?services=lawn-care&size=${sqft}&freq=${freq}&plan=${selected.join(",")}`;

  return (
    <div className={clsx("grid gap-10 lg:grid-cols-12 lg:gap-14 phone:!grid-cols-1 phone:!gap-3", compact && "lg:items-center")}>
      {/* Yard illustration */}
      <div className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e7dcc4] p-3 shadow-[inset_0_0_0_1px_rgba(22,36,28,0.08)] sm:p-5 phone:!rounded-[1.25rem] phone:!p-2">
          <div role="img" aria-label={`A model of a house and a ${sqftLabel} square foot lawn with ${selected.length ? selected.join(", ") : "no services"} selected`}>
            <YardView sqft={sqft} selected={selected} weekly={freq === "weekly"} />
          </div>
          <span className="pointer-events-none absolute left-5 top-5 rounded-full bg-cream/90 px-3.5 py-1.5 font-mono text-[0.72rem] tracking-wide text-forest shadow-[0_2px_12px_rgba(22,36,28,0.12)] backdrop-blur-sm sm:left-7 sm:top-7 phone:!left-3.5 phone:!top-3.5">
            {sqftLabel} sq ft turf
          </span>
        </div>
        <p className="mt-3 text-sm text-muted phone:hidden">
          The model updates live: stripes and a mower for mowing, a steel edge for edging, granules for feeding, weeds pulled, and hedges shaped.
        </p>
      </div>

      {/* Controls */}
      <div className="lg:col-span-5">
        <div className="space-y-8 phone:!space-y-3">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={`${id}-size`} className="t-eyebrow text-faint">
                1 · Yard size
              </label>
              <span className="text-sm text-muted">
                {sqftLabel} sq ft · {acresLabel(sqft)}
              </span>
            </div>
            <input
              id={`${id}-size`}
              type="range"
              className="yard-range mt-2 w-full"
              min={yard.min}
              max={yard.max}
              step={yard.step}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              aria-valuetext={`${sqftLabel} square feet, ${acresLabel(sqft)}`}
              style={{ ["--fill" as string]: fill }}
            />
            <div className="flex justify-between text-xs text-faint phone:!-mt-1.5">
              <span>Townhome</span>
              <span>Half acre</span>
              <span>Estate</span>
            </div>
          </div>

          <fieldset className="min-w-0">
            <legend className="t-eyebrow text-faint">2 · Services</legend>
            <div className="no-scrollbar mt-3 flex flex-wrap gap-2 phone:!-mx-[var(--gutter)] phone:!mt-1.5 phone:!flex-nowrap phone:!gap-1 phone:!overflow-x-auto phone:!px-[var(--gutter)]">
              {planServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on(s.id)}
                  onClick={() => toggle(s.id)}
                  title={s.note}
                  className={clsx(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.95rem] transition-all duration-300 phone:!min-h-10 phone:shrink-0 phone:!gap-1.5 phone:!px-3 phone:whitespace-nowrap phone:!text-[0.86rem]",
                    on(s.id) ? "border-fern bg-fern text-cream" : "border-line text-fg hover:border-fern/50",
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                      on(s.id) ? "border-lantern bg-lantern text-forest" : "border-current/40",
                    )}
                  >
                    {on(s.id) && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.5 6.5l2.2 2L9.5 3.5" />
                      </svg>
                    )}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="t-eyebrow text-faint">3 · How often</legend>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1 phone:!mt-1.5" role="radiogroup">
              {frequencies.map((f) => (
                <label
                  key={f.id}
                  className={clsx(
                    "relative flex min-h-11 cursor-pointer items-center justify-center rounded-full text-[0.95rem] transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracotta phone:!min-h-9",
                    freq === f.id ? "bg-forest text-cream" : "text-fg",
                  )}
                >
                  <input type="radio" name={`${id}-freq`} value={f.id} checked={freq === f.id} onChange={() => setFreq(f.id)} className="sr-only" />
                  {f.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted phone:!mt-1 phone:!text-xs">{frequencies.find((f) => f.id === freq)!.note}</p>
          </fieldset>

          <div className="rounded-[1.5rem] bg-forest p-6 text-cream sm:p-7 phone:!rounded-[1.25rem] phone:!p-3.5">
            <p className="t-eyebrow text-lantern">Estimated monthly</p>
            <p className="mt-3 flex items-baseline gap-2 phone:!mt-1" aria-live="polite">
              <span ref={priceEl} className="font-display text-[clamp(3.2rem,6vw,5rem)] leading-none tracking-[-0.04em] tabular-nums phone:!text-[2.3rem]">
                ${commas(est.monthly)}
              </span>
              <span className="text-cream/70">/ month</span>
            </p>
            <p className="mt-3 text-sm text-cream/75 phone:!mt-1 phone:!text-xs">
              {selected.length === 0
                ? "Pick at least one service to see an estimate."
                : `≈ $${est.perVisit} per visit · ${est.visits} visits a month in season. Exact price after a free 20-minute yard walk.`}
            </p>
            <Button href={quoteHref} variant="lantern" className="mt-6 w-full phone:!mt-2 phone:!min-h-11">
              Get my exact quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
