"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { site } from "@/content/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Home hero. A golden-hour video sits in an arched window between two lines of
 * display type; scrolling opens the arch to full-bleed while the lines drift apart.
 * The intro is CSS-only (poster image is the LCP element); the scroll scene is JS.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion() || conn?.saveData) return;
    // Desktop: start the video after load + idle, so it never competes with the LCP poster.
    // Phones: wait for the first scroll/touch (the still photo slowly zooms until then),
    // which also spares mobile data for visitors who never scroll.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    let id = 0;
    const go = () => setPlayVideo(true);
    const start = () => {
      id = window.setTimeout(go, 1200);
    };
    const events = ["scroll", "touchstart", "pointerdown", "keydown"] as const;
    if (mobile) events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    else if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", start);
      events.forEach((e) => window.removeEventListener(e, go));
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const from = mobile ? "inset(30% 5% 0% 5% round 45vw 45vw 0px 0px)" : "inset(15% 29% 0% 29% round 21vw 21vw 0px 0px)";
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=80%", scrub: 0.8, pin: true, anticipatePin: 1 },
        defaults: { ease: "none" },
      });
      tl.fromTo(".hero-frame", { clipPath: from }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)" }, 0)
        .fromTo(".hero-media", { scale: 1.18 }, { scale: 1 }, 0)
        .fromTo(".hero-l1", { xPercent: 0, yPercent: 0 }, { xPercent: -8, yPercent: -40 }, 0)
        .fromTo(".hero-l2", { xPercent: 0, yPercent: 0 }, { xPercent: 8, yPercent: 30 }, 0)
        .fromTo(".hero-shade", { opacity: 0 }, { opacity: 0.35 }, 0)
        .fromTo(".hero-foot", { opacity: 1, y: 0 }, { opacity: 0, y: 40 }, 0);
    },
    { scope: root },
  );

  return (
    <div>
      <section ref={root} className="theme-forest relative isolate h-[100svh] min-h-[640px] overflow-hidden">
        {/* Arched video window */}
        <div className="hero-frame anim-hero-frame absolute inset-0 -z-10">
          <div className="hero-media absolute inset-0 origin-bottom">
            <div className="hero-still absolute inset-0">
              <Photo slug="hero-poster" sizes="100vw" preload quality={60} alt="Golden sunlight through oak trees over a green lawn" />
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
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-forest/10" />
          <div className="hero-shade absolute inset-0 bg-forest opacity-0" />
        </div>

        <div className="wrap relative flex h-full flex-col justify-between pb-36 pt-[calc(var(--header-h)+1.5rem)] lg:pb-20">
          <h1 className="relative flex flex-1 flex-col justify-between pb-8">
            <span className="t-eyebrow anim-fade block text-lantern">Landscaping &amp; lawn care · Southlake, Texas</span>
            <span
              className="hero-l1 t-mega anim-heading mt-4 block text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)] md:mt-6"
              style={{ ["--d" as string]: "0.1s" }}
            >
              Grown for Texas.
            </span>
            <span
              className="hero-l2 t-mega anim-heading block text-right text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)]"
              style={{ ["--d" as string]: "0.25s" }}
            >
              <span className="t-italic text-lantern">Kept</span> like home.
            </span>
          </h1>

          <div className="hero-foot anim-fade flex flex-col gap-6 md:flex-row md:items-end md:justify-between" style={{ ["--d" as string]: "0.5s" }}>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/free-estimate" variant="light">
                Get a free estimate
              </Button>
              <Button href="/lawn-plans" variant="ghost" className="text-cream">
                Build a lawn plan
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-cream/90">
              <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                <span className="text-lantern" aria-hidden>
                  ★★★★★
                </span>
                {site.rating.value} · {site.rating.count} Google reviews
              </Link>
              <OpenBadge />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
