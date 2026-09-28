"use client";

import { useRef, type CSSProperties } from "react";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { gsap, useGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";

/** Light fixtures in night-reveal.jpg, as % of the photo (2000×1335). r = light-pool radius in % of width. */
const FIXTURES = [
  { x: 29.9, y: 44.2, r: 17, glow: 1.2, name: "Lamp post" },
  { x: 29.5, y: 62, r: 22, glow: 0, name: "Driveway wash" },
  { x: 17.1, y: 47.2, r: 7, glow: 0.7, name: "Garage sconce" },
  { x: 39.5, y: 47.3, r: 7, glow: 0.7, name: "Garage sconce" },
  { x: 47, y: 48, r: 7, glow: 0.7, name: "Garage sconce" },
  { x: 48.9, y: 45.5, r: 5, glow: 0.5, name: "Porthole window" },
  { x: 61.2, y: 46, r: 8, glow: 0.8, name: "Entry sconce" },
  { x: 69.5, y: 45.8, r: 8, glow: 0.8, name: "Entry sconce" },
  { x: 65.2, y: 51, r: 9, glow: 0, name: "Front door" },
  { x: 55, y: 58, r: 13, glow: 0, name: "Bed uplights" },
  { x: 36.5, y: 36, r: 9, glow: 0, name: "Dormer windows" },
  { x: 60.5, y: 31.5, r: 6, glow: 0, name: "Gable window" },
  { x: 78.5, y: 47.5, r: 11, glow: 0, name: "Window wash" },
  { x: 71, y: 63, r: 20, glow: 0, name: "Lawn moonlighting" },
];

const START_MIN = 19 * 60 + 48; // 7:48 pm
const END_MIN = 21 * 60 + 12; // 9:12 pm
const clock = (p: number) => {
  const m = Math.round(START_MIN + (END_MIN - START_MIN) * p);
  const h = Math.floor(m / 60) % 12 || 12;
  return `${h}:${String(m % 60).padStart(2, "0")} pm`;
};

/**
 * Signature #4: day-to-night lighting reveal. A single real dusk photograph:
 * the scene starts unlit (a darkened copy), then each fixture switches on and
 * reveals the real lit photo through a soft light pool. Scroll or drag to control it.
 */
export function NightReveal() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const range = useRef<HTMLInputElement>(null);

  const syncRange = (v: number) => {
    const r = range.current;
    if (!r) return;
    r.value = String(v);
    r.setAttribute("aria-valuetext", clock(v));
  };

  const apply = (progress: number) => {
    const el = stage.current;
    if (!el) return;
    // 0–0.12: sunset fades · 0.12–0.8: fixtures switch on in order · 0.8–1: full scene
    const n = FIXTURES.length;
    FIXTURES.forEach((f, i) => {
      const s = 0.12 + (i / n) * 0.62;
      const t = gsap.utils.clamp(0, 1, (progress - s) / 0.1);
      const flicker = t > 0 && t < 1 ? 0.85 + 0.15 * Math.sin(t * 40) : 1;
      el.style.setProperty(`--r${i}`, `${(f.r * t * flicker).toFixed(2)}%`);
      el.style.setProperty(`--g${i}`, (t * flicker).toFixed(3));
    });
    el.style.setProperty("--sunset", String(gsap.utils.clamp(0, 1, 1 - progress / 0.14)));
    el.style.setProperty("--all", String(gsap.utils.clamp(0, 1, (progress - 0.78) / 0.2)));
    const lit = FIXTURES.filter((_, i) => progress >= 0.12 + (i / n) * 0.62 + 0.05).length;
    const readout = root.current?.querySelector("[data-readout]");
    if (readout) readout.textContent = `${clock(progress)} · ${lit}/${n} fixtures on`;
  };

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const proxy = { v: reduce || !belowFold(root.current!) ? 1 : 0 };
      apply(proxy.v);
      syncRange(proxy.v);
      if (reduce) return;
      const tl = gsap.timeline({ paused: true }).to(proxy, {
        v: 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          apply(proxy.v);
          syncRange(proxy.v);
        },
      });
      tl.progress(proxy.v);
      tlRef.current = tl;
      gsap.to(tl, {
        progress: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", pin: true, scrub: 0.6, anticipatePin: 1 },
      });
    },
    { scope: root },
  );

  const onRange = (v: number) => {
    if (tlRef.current) tlRef.current.progress(v);
    else apply(v);
    syncRange(v);
  };

  const mask = FIXTURES.map(
    (f, i) => `radial-gradient(circle at ${f.x}% ${f.y}%, #000 0, rgba(0,0,0,0.85) calc(var(--r${i}) * 0.35), transparent var(--r${i}))`,
  ).join(", ");

  return (
    <div>
      <section ref={root} aria-labelledby="night-title" className="theme-forest relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0b1218]">
        <div
          ref={stage}
          className="absolute left-1/2 top-1/2 aspect-[2000/1335] w-[max(100vw,149.8svh)] -translate-x-1/2 -translate-y-1/2"
          style={
            {
              ...Object.fromEntries(
                FIXTURES.flatMap((f, i) => [
                  [`--r${i}`, `${f.r}%`],
                  [`--g${i}`, 1],
                ]),
              ),
              "--sunset": 0,
              "--all": 1,
            } as CSSProperties
          }
        >
          {/* Unlit: the same photo, darkened and cooled (static filter, never tweened). */}
          <div className="absolute inset-0 [filter:brightness(0.3)_saturate(0.45)_contrast(1.08)]">
            <Photo slug="night-reveal" sizes="(min-width: 768px) 100vw, 150vh" quality={75} decorative />
          </div>
          <div className="absolute inset-0 bg-[#10203a] mix-blend-multiply opacity-60" />
          {/* Sunset glow that fades as evening falls */}
          <div
            className="absolute inset-0"
            style={{
              opacity: "var(--sunset)",
              background: "linear-gradient(180deg, rgba(240,150,90,0.55) 0%, rgba(240,170,110,0.2) 35%, rgba(20,30,40,0) 60%)",
            }}
          />
          {/* Lit photo through light pools */}
          <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
            <Photo slug="night-reveal" sizes="(min-width: 768px) 100vw, 150vh" quality={75} alt="Home at dusk with landscape lighting on" />
          </div>
          {/* Full scene once every fixture is on */}
          <div className="absolute inset-0" style={{ opacity: "var(--all)" }}>
            <Photo slug="night-reveal" sizes="(min-width: 768px) 100vw, 150vh" quality={75} decorative />
          </div>
          {/* Fixture glows */}
          {FIXTURES.map((f, i) =>
            f.glow ? (
              <span
                key={i}
                aria-hidden
                className="absolute block aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: `${f.glow * 4}%`,
                  opacity: `var(--g${i})`,
                  background: "radial-gradient(circle, rgba(255,236,190,0.95) 0%, rgba(255,196,110,0.45) 22%, rgba(255,170,80,0) 65%)",
                }}
              />
            ) : null,
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1218]/80 via-transparent to-[#0b1218]/85" />

        <div className="wrap relative flex h-full flex-col justify-between pb-8 pt-[calc(var(--header-h)+1.5rem)]">
          <div className="max-w-xl">
            <p className="t-eyebrow text-lantern">Outdoor lighting</p>
            <h2 id="night-title" className="t-h2 mt-4 text-cream">
              Your yard shouldn&rsquo;t <span className="t-italic text-lantern">disappear</span> at sunset.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-md">
              <p className="font-mono text-sm tracking-wide text-lantern" data-readout aria-live="off">
                9:12 pm · 14/14 fixtures on
              </p>
              <label htmlFor="night-range" className="mt-4 block text-sm text-cream/75">
                Drag from sunset to full evening
              </label>
              <input
                id="night-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                ref={range}
                defaultValue={1}
                onChange={(e) => onRange(Number(e.target.value))}
                aria-valuetext={clock(1)}
                className="night-range mt-3 w-full max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <p className="max-w-xs text-sm text-cream/75 md:text-right">
                Warm 2700K brass fixtures, zero glare, on a smart timer. We&rsquo;ll show you in your own yard, after dark.
              </p>
              <Button href="/services/outdoor-lighting" variant="lantern" className="pointer-events-auto">
                Book a night demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
