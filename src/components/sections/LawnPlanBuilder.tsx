"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { acresLabel, estimate, frequencies, planServices, yard, type Frequency, type PlanServiceId } from "@/content/pricing";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** Deterministic pseudo-random points so server and client render the same yard. */
const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
const r1 = rand(11);
const FERT = Array.from({ length: 34 }, () => ({ x: 40 + r1() * 250, y: 122 + r1() * 216 }));
const r2 = rand(29);
const WEEDS = Array.from({ length: 11 }, () => ({ x: 50 + r2() * 230, y: 132 + r2() * 196 }));

/**
 * Signature #2: lawn-plan builder. Yard size, services and frequency update a
 * top-down yard illustration and an animated monthly estimate.
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
      el.textContent = `$${est.monthly.toLocaleString("en-US")}`;
      return;
    }
    const obj = { n: from };
    const tw = gsap.to(obj, {
      n: est.monthly,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = `$${Math.round(obj.n).toLocaleString("en-US")}`;
      },
    });
    return () => {
      tw.kill();
    };
  }, [est.monthly]);

  // Lawn grows from the house as the yard gets bigger.
  const t = (sqft - yard.min) / (yard.max - yard.min);
  const scale = 0.62 + 0.38 * t;
  const fill = `${(t * 100).toFixed(1)}%`;

  const quoteHref = `/free-estimate?services=lawn-care&size=${sqft}&freq=${freq}&plan=${selected.join(",")}`;

  return (
    <div className={clsx("grid gap-10 lg:grid-cols-12 lg:gap-14", compact && "lg:items-center")}>
      {/* Yard illustration */}
      <div className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e7dcc4] p-3 shadow-[inset_0_0_0_1px_rgba(22,36,28,0.08)] sm:p-5">
          <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-labelledby={`${id}-svg`}>
            <title id={`${id}-svg`}>
              {`Top-down illustration of a ${sqft.toLocaleString("en-US")} square foot lawn with ${selected.length ? selected.join(", ") : "no services"} selected`}
            </title>
            <defs>
              <pattern id={`${id}-stripes`} width="28" height="28" patternUnits="userSpaceOnUse">
                <rect width="14" height="28" fill="#5f7d3e" />
                <rect x="14" width="14" height="28" fill="#6f8f49" />
              </pattern>
              <pattern id={`${id}-shaggy`} width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#7c8c4c" />
                <path d="M2 10l1-4M6 11l.5-5M10 10l-1-4" stroke="#6b7a3f" strokeWidth="1" />
              </pattern>
              <clipPath id={`${id}-lawn-clip`}>
                <rect x="24" y="112" width="432" height="236" rx="22" />
              </clipPath>
            </defs>

            {/* property line */}
            <rect x="8" y="8" width="464" height="344" rx="16" fill="none" stroke="#16241c" strokeOpacity="0.25" strokeDasharray="4 6" />

            <g style={{ transform: `scale(${scale})`, transformOrigin: "240px 108px", transition: "transform 900ms var(--ease-out-expo)" }}>
              {/* lawn */}
              <g clipPath={`url(#${id}-lawn-clip)`}>
                <rect x="24" y="112" width="432" height="236" fill={`url(#${id}-shaggy)`} />
                <rect
                  x="24"
                  y="112"
                  width="432"
                  height="236"
                  fill={`url(#${id}-stripes)`}
                  style={{ opacity: on("mowing") ? 1 : 0, transition: "opacity 700ms ease" }}
                />
                {/* mower */}
                {on("mowing") && (
                  <g className="yard-mower">
                    <rect x="-9" y="-7" width="18" height="14" rx="3" fill="#a3472c" />
                    <rect x="-6" y="-12" width="12" height="4" rx="1.5" fill="#16241c" />
                  </g>
                )}
                {/* fertilizer granules */}
                <g>
                  {FERT.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x * 1.4}
                      cy={p.y}
                      r="2.2"
                      fill="#f3ede1"
                      style={{
                        opacity: on("fertilization") ? 0.9 : 0,
                        transform: on("fertilization") ? "scale(1)" : "scale(0)",
                        transformOrigin: `${p.x * 1.4}px ${p.y}px`,
                        transition: `opacity 400ms ${i * 18}ms, transform 500ms ${i * 18}ms var(--ease-out-expo)`,
                      }}
                    />
                  ))}
                </g>
                {/* weeds (visible when weed control is off) */}
                <g>
                  {WEEDS.map((p, i) => (
                    <g
                      key={i}
                      style={{
                        opacity: on("weeds") ? 0 : 1,
                        transform: on("weeds") ? "scale(0) rotate(40deg)" : "scale(1)",
                        transformOrigin: `${p.x * 1.4}px ${p.y}px`,
                        transition: `opacity 400ms ${i * 30}ms, transform 500ms ${i * 30}ms`,
                      }}
                    >
                      <path
                        d={`M${p.x * 1.4} ${p.y}l-5-4M${p.x * 1.4} ${p.y}l5-4M${p.x * 1.4} ${p.y}l0-6`}
                        stroke="#4f5f2c"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <circle cx={p.x * 1.4} cy={p.y - 7} r="2.6" fill="#e8c14a" />
                    </g>
                  ))}
                </g>
              </g>

              {/* crisp edge */}
              <rect
                x="24"
                y="112"
                width="432"
                height="236"
                rx="22"
                fill="none"
                stroke="#a3472c"
                strokeWidth="3"
                pathLength={1}
                strokeDasharray="1"
                style={{ strokeDashoffset: on("edging") ? 0 : 1, transition: "stroke-dashoffset 1.2s var(--ease-organic)" }}
              />

              {/* hedges along the sides */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <g key={i}>
                  {[14, 466].map((x) => (
                    <path
                      key={x}
                      d={
                        on("hedges")
                          ? `M${x - 10} ${134 + i * 30} a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0Z`
                          : `M${x - 12} ${136 + i * 30} q-2 -12 8 -14 q6 -8 13 1 q9 2 5 12 q3 10 -8 11 q-6 6 -12 0 q-9 0 -6 -10Z`
                      }
                      fill={on("hedges") ? "#2f4a34" : "#48613a"}
                      style={{ transition: "d 600ms var(--ease-out-expo), fill 600ms" }}
                    />
                  ))}
                </g>
              ))}

              {/* driveway */}
              <rect x="300" y="104" width="44" height="256" fill="#d9cdb4" />
              <path d="M300 104v256M344 104v256" stroke="#16241c" strokeOpacity="0.12" />

              {/* trees */}
              <circle cx="96" cy="210" r="40" fill="#16241c" opacity="0.18" transform="translate(8 8)" />
              <circle cx="96" cy="210" r="40" fill="#2f4a34" />
              <circle cx="84" cy="198" r="16" fill="#3d5c3f" />
              <circle cx="400" cy="286" r="28" fill="#16241c" opacity="0.18" transform="translate(6 6)" />
              <circle cx="400" cy="286" r="28" fill="#2f4a34" />
            </g>

            {/* house (fixed) */}
            <g>
              <rect x="150" y="22" width="180" height="86" rx="4" fill="#b9ab8f" />
              <path d="M150 22l40 43h100l40-43M190 65v43M290 65v43" stroke="#8d7f63" strokeWidth="2" fill="none" />
              <rect x="222" y="104" width="36" height="8" rx="2" fill="#8d7f63" />
            </g>

            {/* measurement label */}
            <g fontFamily="var(--font-dm-mono)" fontSize="11" fill="#16241c">
              <rect x="16" y="16" width="140" height="26" rx="13" fill="#f3ede1" />
              <text x="30" y="33">
                {sqft.toLocaleString("en-US")} sq ft turf
              </text>
            </g>
          </svg>
        </div>
        <p className="mt-3 text-sm text-muted">
          Illustration updates live: stripes for mowing, a crisp edge for edging, granules for feeding, and hedges that tidy up.
        </p>
      </div>

      {/* Controls */}
      <div className="lg:col-span-5">
        <div className="space-y-8">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={`${id}-size`} className="t-eyebrow text-faint">
                1 · Yard size
              </label>
              <span className="text-sm text-muted">
                {sqft.toLocaleString("en-US")} sq ft · {acresLabel(sqft)}
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
              aria-valuetext={`${sqft.toLocaleString("en-US")} square feet, ${acresLabel(sqft)}`}
              style={{ ["--fill" as string]: fill }}
            />
            <div className="flex justify-between text-xs text-faint">
              <span>Townhome</span>
              <span>Half acre</span>
              <span>Estate</span>
            </div>
          </div>

          <fieldset>
            <legend className="t-eyebrow text-faint">2 · Services</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {planServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on(s.id)}
                  onClick={() => toggle(s.id)}
                  title={s.note}
                  className={clsx(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.95rem] transition-all duration-300",
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
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1" role="radiogroup">
              {frequencies.map((f) => (
                <label
                  key={f.id}
                  className={clsx(
                    "relative flex min-h-11 cursor-pointer items-center justify-center rounded-full text-[0.95rem] transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracotta",
                    freq === f.id ? "bg-forest text-cream" : "text-fg",
                  )}
                >
                  <input type="radio" name={`${id}-freq`} value={f.id} checked={freq === f.id} onChange={() => setFreq(f.id)} className="sr-only" />
                  {f.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{frequencies.find((f) => f.id === freq)!.note}</p>
          </fieldset>

          <div className="rounded-[1.5rem] bg-forest p-6 text-cream sm:p-7">
            <p className="t-eyebrow text-lantern">Estimated monthly</p>
            <p className="mt-3 flex items-baseline gap-2" aria-live="polite">
              <span ref={priceEl} className="font-display text-[clamp(3.2rem,6vw,5rem)] leading-none tracking-[-0.04em] tabular-nums">
                ${est.monthly.toLocaleString("en-US")}
              </span>
              <span className="text-cream/70">/ month</span>
            </p>
            <p className="mt-3 text-sm text-cream/75">
              {selected.length === 0
                ? "Pick at least one service to see an estimate."
                : `≈ $${est.perVisit} per visit · ${est.visits} visits a month in season. Exact price after a free 20-minute yard walk.`}
            </p>
            <Button href={quoteHref} variant="lantern" className="mt-6 w-full">
              Get my exact quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
