"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { useBiz } from "@/components/preview/BizContext";
import { alt as altFor, imgSrc } from "@/content/images";
import { telOf } from "@/lib/biz-core";
import { gsap, useGSAP, isPhone, loadMotion, prefersReducedMotion } from "@/lib/gsap";

type Grass = ComponentType<{ mow: RefObject<{ p: number }>; className?: string }>;

const HERO_ALT = "Golden sunlight through oak trees over a green lawn";

/** The phone's own still: a real project at golden hour, kept under 100 KB by capping the widths it can pick. */
const phoneStill = getImageProps({ src: imgSrc("firepit-evening"), alt: altFor("firepit-evening"), fill: true, sizes: "100vw", quality: 60 }).props;
const upTo = (max: number) =>
  (phoneStill.srcSet ?? "")
    .split(", ")
    .filter((c) => parseInt(c.split(" ")[1], 10) <= max)
    .join(", ");

/**
 * Home hero. A golden-hour video sits in an arched window between two lines of
 * display type; scrolling opens the arch to full-bleed while the lines drift apart.
 * The intro is CSS-only (poster image is the LCP element); the scroll scene is JS.
 * A fringe of wild grass grows in along the bottom, parts around the pointer, and the
 * same scroll rolls a mower across it: "Grown" on arrival, "Kept" as you scroll.
 *
 * Phones: none of that. A still of a real project, service + town in the headline, the rating and
 * a Call button showing the number, all on the first paint. A strip of lawn along the foot gets
 * mowed once on load; the next section peeks in underneath.
 */
export function Hero() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [Grass, setGrass] = useState<Grass | null>(null);
  const mow = useRef({ p: 0 });

  useEffect(() => {
    if (isPhone()) return;
    void Promise.all([import("@/components/fx/HeroGrass"), loadMotion()]).then(([m]) => setGrass(() => m.HeroGrass));
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion() || conn?.saveData) return;
    // Start the video after load + idle, so it never competes with the LCP poster.
    let id = 0;
    const start = () => {
      id = window.setTimeout(() => setPlayVideo(true), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", start);
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=80%", scrub: 0.8, pin: true, anticipatePin: 1 },
        defaults: { ease: "none" },
      });
      tl.fromTo(".hero-frame", { clipPath: "inset(15% 29% 0% 29% round 21vw 21vw 0px 0px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)" }, 0)
        .fromTo(".hero-media", { scale: 1.18 }, { scale: 1 }, 0)
        .fromTo(".hero-l1", { xPercent: 0, yPercent: 0 }, { xPercent: -8, yPercent: -40 }, 0)
        .fromTo(".hero-l2", { xPercent: 0, yPercent: 0 }, { xPercent: 8, yPercent: 30 }, 0)
        .fromTo(".hero-shade", { opacity: 0 }, { opacity: 0.35 }, 0)
        .fromTo(".hero-foot", { opacity: 1, y: 0 }, { opacity: 0, y: 40 }, 0)
        .fromTo(mow.current, { p: 0 }, { p: 1, duration: 0.95 }, 0.05);
    },
    { scope: root },
  );

  const tel = telOf(biz);

  return (
    <div>
      <section ref={root} className="hero-section theme-forest relative isolate h-[100svh] min-h-[640px] overflow-hidden">
        {/* Arched video window */}
        <div className="hero-frame anim-hero-frame absolute inset-0 -z-10">
          <div className="hero-media absolute inset-0 origin-bottom">
            <div className="hero-still absolute inset-0">
              {/* Desktop: the poster behind the video. Phones: a project photo (the browser fetches only one). */}
              <picture>
                <source media="(max-width: 767px)" srcSet={upTo(1080)} sizes={phoneStill.sizes} />
                <source media="(hover: none) and (pointer: coarse)" srcSet={upTo(1920)} sizes={phoneStill.sizes} />
                <Image src={imgSrc("hero-poster")} alt={HERO_ALT} fill sizes="100vw" quality={60} loading="eager" fetchPriority="high" className="object-cover" />
              </picture>
            </div>
            {playVideo && (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000"
                src="/video/hero.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                onCanPlay={(e) => e.currentTarget.classList.add("opacity-100")}
              />
            )}
          </div>
          <div className="hero-veil absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-forest/10" />
          <div className="hero-shade absolute inset-0 bg-forest opacity-0" />
        </div>

        {/* Desktop grass comes with its own chunk; phones never load it */}
        {Grass && <Grass mow={mow} className="pointer-events-none absolute inset-x-0 bottom-[4.4rem] h-[40%] w-full lg:bottom-0 lg:h-[44%]" />}

        {/* Phones: the one lawn touch, mowed once along the foot of the hero */}
        <div aria-hidden className="hero-lawn">
          <span className="hero-lawn-cut" />
          <svg viewBox="0 0 44 30" className="hero-mower">
            <path d="M12 16L2 3" fill="none" stroke="#f3ede1" strokeWidth={2} strokeLinecap="round" />
            <path d="M9 13h22q7 0 9 7v2H9z" fill="#a3472c" />
            <rect x={20} y={8} width={12} height={6} rx={2} fill="#16241c" />
            <circle cx={14} cy={24} r={5} fill="#16241c" />
            <circle cx={35} cy={24} r={5} fill="#16241c" />
          </svg>
        </div>

        <div className="hero-body wrap relative flex h-full flex-col justify-between pb-36 pt-[calc(var(--header-h)+1.5rem)] lg:pb-20">
          <h1 className="hero-head relative flex flex-1 flex-col justify-between pb-8">
            <span className="hero-eyebrow t-eyebrow anim-fade block text-lantern">{biz.preview ? `Landscaping & lawn care · ${biz.area}` : "Landscaping & lawn care · Southlake, Texas"}</span>
            <span className={biz.area.length > 16 ? "hero-svc hero-svc-long" : "hero-svc"}>
              Landscaping in <span className="t-italic text-lantern">{biz.area}</span>
            </span>
            <span
              className="hero-l1 t-mega anim-heading mt-4 block text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)] md:mt-6"
              style={{ ["--d" as string]: "0.1s" }}
            >
              {biz.preview ? "Grown here." : "Grown for Texas."}
            </span>
            <span
              className="hero-l2 t-mega anim-heading block text-right text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)]"
              style={{ ["--d" as string]: "0.25s" }}
            >
              <span className="t-italic text-lantern">Kept</span> like home.
            </span>
          </h1>

          <div className="hero-foot anim-fade flex flex-col gap-6 md:flex-row md:items-end md:justify-between" style={{ ["--d" as string]: "0.5s" }}>
            <div className="hero-cta flex flex-wrap items-center gap-3">
              {tel && (
                <Button href={tel} variant="lantern" icon="phone" className="hero-call">
                  Call {biz.phoneDisplay}
                </Button>
              )}
              <Button href="/free-estimate" variant="light" className="hero-more">
                Get a free estimate
              </Button>
              <Button href="/lawn-plans" variant="ghost" className="hero-more text-cream">
                Build a lawn plan
              </Button>
            </div>
            <div className="hero-facts flex flex-wrap items-center gap-3 text-cream/90">
              {biz.rating && (
                <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                  <span className="text-lantern" aria-hidden>
                    ★★★★★
                  </span>
                  {biz.rating.value} · {biz.rating.count} Google reviews
                </Link>
              )}
              <OpenBadge />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
