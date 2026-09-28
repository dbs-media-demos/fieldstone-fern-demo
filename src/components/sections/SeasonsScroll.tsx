"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { Photo } from "@/components/ui/Photo";
import { SeasonParticles, type ParticleMode } from "@/components/fx/SeasonParticles";
import { seasons } from "@/content/misc";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Signature #1: a pinned scene that scrolls through Spring → Winter.
 * The photo wipes open from the season dial, the palette shifts, and the
 * particle layer changes (petals, heat motes, leaves, snow).
 *
 * Server render / reduced motion: four stacked, fully visible panels.
 */
export function SeasonsScroll() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- upgrade to the scroll scene only when motion is allowed
    if (!prefersReducedMotion()) setPinned(true);
  }, []);

  // Stable wrapper: GSAP pinning inserts a spacer around the section, which must stay out of React's way.
  return <div>{pinned ? <PinnedSeasons /> : <StaticSeasons />}</div>;
}

function StaticSeasons() {
  return (
    <section aria-labelledby="seasons-title" className="theme-forest">
      <h2 id="seasons-title" className="sr-only">
        Four seasons, one crew
      </h2>
      {seasons.map((s) => (
        <article key={s.id} className="relative isolate flex min-h-[80svh] items-end overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Photo slug={s.img} sizes="100vw" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${s.tint}55, ${s.tint}ee)` }} />
          </div>
          <div className="wrap grid gap-8 py-16 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="t-eyebrow" style={{ color: s.accent }}>
                {s.months}
              </p>
              <h3 className="t-mega t-italic mt-3" style={{ color: s.accent }}>
                {s.name}
              </h3>
              <p className="t-lead mt-5 max-w-md text-cream/90">{s.line}</p>
            </div>
            <ul className="space-y-3 text-lg text-cream">
              {s.services.map((x) => (
                <li key={x} className="border-b border-cream/20 pb-3">
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  );
}

function PinnedSeasons() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<ParticleMode>("spring");
  const stRef = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const bgs = q(".s-bg");
      const imgs = q(".s-img");
      const names = q(".s-name");
      const lines = q(".s-line");
      const lists = q(".s-list");
      const ticks = q(".s-tick");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          snap: { snapTo: 1 / 3, duration: { min: 0.3, max: 0.9 }, delay: 0.08, ease: "power2.inOut" },
          onUpdate: (self) => {
            const idx = Math.round(self.progress * 3);
            setMode(seasons[idx].id);
            ticks.forEach((t, i) => t.classList.toggle("is-active", i === idx));
            const num = root.current?.querySelector("[data-snum]");
            if (num) num.textContent = `0${idx + 1}`;
          },
        },
      });
      stRef.current = tl.scrollTrigger ?? null;

      imgs.forEach((img) => gsap.set(img, { scale: 1.2 }));
      gsap.set(imgs[0], { scale: 1.05 });

      for (let i = 1; i < seasons.length; i++) {
        const at = i - 1 + 0.15;
        const s = seasons[i];
        tl.fromTo(bgs[i], { clipPath: "circle(0% at 88% 88%)" }, { clipPath: "circle(145% at 88% 88%)", duration: 0.75, ease: "power2.inOut" }, at)
          .fromTo(imgs[i], { scale: 1.2 }, { scale: 1.05, duration: 0.9, ease: "power2.out" }, at)
          .to(names[i - 1], { yPercent: -105, opacity: 0, duration: 0.4, ease: "power2.in" }, at)
          .fromTo(names[i], { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, at + 0.3)
          .to([lines[i - 1], lists[i - 1]], { opacity: 0, y: -24, duration: 0.3 }, at)
          .fromTo([lines[i], lists[i]], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, at + 0.35)
          .to(root.current, { "--tint": s.tint, "--acc": s.accent, duration: 0.6 }, at);
      }
      tl.fromTo(".s-frost", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.2);
      tl.fromTo(".s-progress", { scaleX: 0 }, { scaleX: 1, duration: 3, ease: "none" }, 0);
      tl.to({}, { duration: 0.15 }, 3);
      // This pin is created after the first render (static → pinned), i.e. after the pins
      // further down the page. Re-sort by position and re-measure so they account for it.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    const y = st.start + ((st.end - st.start) * i) / 3 + 2;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const s0 = seasons[0];

  return (
    <section
      ref={root}
      aria-labelledby="seasons-title"
      className="theme-forest relative isolate h-[100svh] min-h-[620px] overflow-hidden"
      style={{ "--tint": s0.tint, "--acc": s0.accent } as CSSProperties}
    >
      {seasons.map((s, i) => (
        <div key={s.id} className="s-bg absolute inset-0" style={{ zIndex: i, clipPath: i ? "circle(0% at 88% 88%)" : undefined }}>
          <div className="s-img absolute inset-0">
            <Photo slug={s.img} sizes="100vw" alt={`${s.name} in a North Texas garden`} />
          </div>
        </div>
      ))}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--tint) 70%, transparent) 0%, color-mix(in oklab, var(--tint) 10%, transparent) 38%, color-mix(in oklab, var(--tint) 30%, transparent) 60%, color-mix(in oklab, var(--tint) 92%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden
        className="s-frost absolute inset-0 z-10 opacity-0"
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(228,240,248,0.45) 88%, rgba(240,248,255,0.75) 100%)" }}
      />
      <SeasonParticles mode={mode} className="pointer-events-none absolute inset-0 z-20 h-full w-full" />

      <div className="wrap relative z-30 flex h-full flex-col justify-between pb-8 pt-[calc(var(--header-h)+1.5rem)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="t-eyebrow" style={{ color: "var(--acc)" }}>
              Four seasons · one crew
            </p>
            <h2
              id="seasons-title"
              className="font-display mt-3 max-w-[20ch] text-[clamp(1.4rem,2.2vw,2.1rem)] leading-[1.1] tracking-[-0.02em] text-cream"
            >
              Your yard changes every season. So does what we do in it.
            </h2>
          </div>
          <div className="t-eyebrow flex shrink-0 items-center gap-1 whitespace-nowrap text-cream/80" aria-hidden>
            <span data-snum>01</span>/ 04
          </div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative h-[0.95em] overflow-hidden t-mega">
              {seasons.map((s, i) => (
                <h3
                  key={s.id}
                  className="s-name t-italic absolute inset-x-0 top-0 whitespace-nowrap"
                  style={{ color: "var(--acc)", opacity: i ? 0 : 1 }}
                >
                  {s.name}
                </h3>
              ))}
            </div>
            <div className="relative mt-5 min-h-[4.5em] max-w-md">
              {seasons.map((s, i) => (
                <p key={s.id} className="s-line t-lead absolute inset-x-0 top-0 text-cream" style={{ opacity: i ? 0 : 1 }}>
                  <span className="t-eyebrow mb-2 block text-cream/70">{s.months}</span>
                  {s.line}
                </p>
              ))}
            </div>
          </div>
          <div className="relative min-h-[15.5rem] lg:col-span-5">
            {seasons.map((s, i) => (
              <ul key={s.id} className="s-list absolute inset-x-0 bottom-0 space-y-0 text-cream" style={{ opacity: i ? 0 : 1 }}>
                {s.services.map((x) => (
                  <li key={x} className="flex items-center justify-between gap-4 border-b border-cream/25 py-2.5 text-[1.02rem] sm:text-lg">
                    {x}
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--acc)" }} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="relative h-px bg-cream/25">
            <div className="s-progress absolute inset-0 origin-left" style={{ background: "var(--acc)" }} />
          </div>
          <div className="mt-3 grid grid-cols-4">
            {seasons.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={clsx(
                  "s-tick group flex min-h-11 flex-col items-start text-left text-cream/60 transition-colors [&.is-active]:text-cream",
                  i === 0 && "is-active",
                )}
              >
                <span className="t-eyebrow">{s.name}</span>
                <span className="hidden text-sm sm:block">{s.months}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
