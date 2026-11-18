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
import { after3DGate, demote3D, queue3D } from "@/lib/three-gate";
import type { HeroLawn } from "@/components/fx/lawn3d/HeroLawnScene";
import type { Lawn2D } from "@/components/fx/lawn2d/LawnStripes";

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
 *
 * The centrepiece is a real-time 3D lawn (three.js, desktop only): a crew member on a ride-on
 * mower half way through the job. The same scroll drives it down three lanes, cutting stripes and
 * throwing clippings: "Grown" on arrival, "Kept" as you scroll. A still rendered from that scene
 * is in the server HTML; the canvas fades in over it once the 3D gate passes after load and the scene
 * is compiled and has drawn a frame unseen. If its first 2 s run slow it fades back to the still,
 * frees the GPU and the rest of the visit stays on stills. Desktops
 * that fail the gate (narrow, reduced motion, no WebGL2) keep the still, or get the light 2D grass.
 *
 * Phones: none of that. A still of a real project, service + town in the headline, the rating and
 * a Call button showing the number, all on the first paint, and a still from the 3D lawn along the
 * foot (zero bytes of three.js); the next section peeks in underneath.
 *
 * `variant="2d"` is the /v2 hero (the homepage without 3D): the same window, words and scroll, with
 * the lawn drawn in canvas 2D from plates rendered off the 3D scene (fx/lawn2d): the mower drives in,
 * cuts its lane and, with the scroll, the next two. No three.js, no WebGL, at any width; the heading,
 * text and buttons are there on the first paint without an intro. Phones see the same hero as on /.
 */
export function Hero({ variant = "3d" }: { variant?: "3d" | "2d" } = {}) {
  const flat = variant === "2d";
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [Grass, setGrass] = useState<Grass | null>(null);
  const [lawnLive, setLawnLive] = useState(false);
  const lawnCanvas = useRef<HTMLCanvasElement>(null);
  const mow = useRef({ p: 0 });
  const [flatLive, setFlatLive] = useState(false);
  const flatCanvas = useRef<HTMLCanvasElement>(null);
  const flatStill = useRef<HTMLImageElement>(null);

  // The 3D lawn: only after load, only past the gate, three.js fetched inside the callback.
  useEffect(() => {
    if (flat || isPhone()) return;
    let lawn: HeroLawn | null = null;
    let disposed = false;
    let detach = () => {};
    let drop = 0;
    const cancel = after3DGate(
      () => void queue3D(async () => {
        const { createHeroLawn } = await import("@/components/fx/lawn3d/HeroLawnScene");
        const cv = lawnCanvas.current;
        const host = root.current;
        if (disposed || !cv || !host) return;
        try {
          lawn = await createHeroLawn(cv, {
            progress: () => mow.current.p,
            onReady: () => !disposed && setLawnLive(true),
            // too slow for this machine: back to the still (two slow page loads keep it for the visit), then free the GPU
            onSlow: () => {
              demote3D("slow");
              detach();
              lawn?.setVisible(false); // freeze on the last frame while it fades out
              setLawnLive(false);
              drop = window.setTimeout(() => {
                lawn?.dispose();
                lawn = null;
              }, 1500);
            },
          });
        } catch {
          demote3D("gpu"); // no WebGL or no proper GPU: the still stays, and so do the others
          return;
        }
        const l = lawn;
        if (disposed) return l.dispose();
        const onMove = (e: PointerEvent) => {
          const r = cv.getBoundingClientRect();
          l.setPointer(e.clientX - r.left, e.clientY - r.top);
        };
        const onLeave = () => l.clearPointer();
        const io = new IntersectionObserver(([en]) => l.setVisible(en.isIntersecting));
        const ro = new ResizeObserver(() => l.resize());
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        io.observe(host);
        ro.observe(cv);
        detach = () => {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          io.disconnect();
          ro.disconnect();
        };
        await l.settled;
      }),
      () => {
        if (prefersReducedMotion()) return; // the still is the reduced-motion frame
        void Promise.all([import("@/components/fx/HeroGrass"), loadMotion()]).then(([m]) => !disposed && setGrass(() => m.HeroGrass));
      },
    );
    return () => {
      disposed = true;
      cancel();
      detach();
      window.clearTimeout(drop);
      lawn?.dispose();
    };
  }, [flat]);

  // /v2: the 2D lawn, desktop only, fetched after load (phones keep the still and never download it)
  useEffect(() => {
    if (!flat || isPhone()) return;
    let lawn: Lawn2D | null = null;
    let disposed = false;
    let detach = () => {};
    const go = async () => {
      const { createLawn2D } = await import("@/components/fx/lawn2d/LawnStripes");
      const cv = flatCanvas.current;
      const host = root.current;
      if (disposed || !cv || !host) return;
      const l = await createLawn2D(cv, {
        progress: () => mow.current.p,
        reduced: prefersReducedMotion(),
        still: flatStill.current,
        onReady: () => !disposed && setFlatLive(true),
      }).catch(() => null);
      if (!l) return;
      if (disposed) return l.dispose();
      lawn = l;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const r = cv.getBoundingClientRect();
        l.setPointer(e.clientX - r.left, e.clientY - r.top);
      };
      const onLeave = () => l.clearPointer();
      const io = new IntersectionObserver(([en]) => l.setVisible(en.isIntersecting));
      const ro = new ResizeObserver(() => l.resize());
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      io.observe(host);
      ro.observe(cv);
      detach = () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        io.disconnect();
        ro.disconnect();
      };
    };
    let wait = 0;
    const start = () => {
      wait = window.setTimeout(() => void go(), 60);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      disposed = true;
      window.clearTimeout(wait);
      window.removeEventListener("load", start);
      detach();
      lawn?.dispose();
    };
  }, [flat]);

  useEffect(() => {
    if (isPhone()) return;
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
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=100%", scrub: 0.8, pin: true, anticipatePin: 1 },
        defaults: { ease: "none" },
      });
      tl.fromTo(".hero-frame", { clipPath: "inset(15% 29% 0% 29% round 21vw 21vw 0px 0px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)" }, 0)
        .fromTo(".hero-media", { scale: 1.18 }, { scale: 1 }, 0);
      // On / the headline and buttons are held by their CSS intro (fill-mode both) through this scroll;
      // /v2 has no intro, so it leaves them out and they stay put the same way.
      if (!flat) tl.fromTo(".hero-l1", { xPercent: 0, yPercent: 0 }, { xPercent: -8, yPercent: -40 }, 0).fromTo(".hero-l2", { xPercent: 0, yPercent: 0 }, { xPercent: 8, yPercent: 30 }, 0);
      tl.fromTo(".hero-shade", { opacity: 0 }, { opacity: 0.35 }, 0);
      if (!flat) tl.fromTo(".hero-foot", { opacity: 1, y: 0 }, { opacity: 0, y: 40 }, 0);
      tl.fromTo(mow.current, { p: 0 }, { p: 1, duration: 0.95 }, 0.05);
    },
    { scope: root },
  );

  const tel = telOf(biz);

  return (
    <div>
      <section ref={root} data-hero={flat ? "2d" : undefined} className="hero-section theme-forest relative isolate h-[100svh] min-h-[640px] overflow-hidden">
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

        {/* The lawn: a still rendered from the 3D scene (server HTML, and all a phone ever gets) … */}
        {flat ? (
          <picture className={`hero-lawn-still pointer-events-none absolute inset-x-0 bottom-0 h-[58%] transition-opacity duration-1000 ${flatLive ? "opacity-0" : ""}`}>
            <source media="(max-width: 767px), (hover: none) and (pointer: coarse)" type="image/avif" srcSet="/images/3d/hero-lawn-phone.avif" width={750} height={250} />
            <source media="(max-width: 767px), (hover: none) and (pointer: coarse)" type="image/webp" srcSet="/images/3d/hero-lawn-phone.webp" width={750} height={250} />
            {/* /v2: the plate the 2D mower works on, before it arrives */}
            <source type="image/avif" srcSet="/images/3d/v2/plate.avif" />
            <img ref={flatStill} src="/images/3d/v2/plate.webp" alt="" aria-hidden width={1800} height={600} decoding="async" fetchPriority="low" className="h-full w-full object-cover object-bottom" />
          </picture>
        ) : (
          <picture className={`hero-lawn-still pointer-events-none absolute inset-x-0 bottom-0 h-[58%] transition-opacity duration-1000 ${lawnLive || Grass ? "opacity-0" : ""}`}>
            <source media="(max-width: 767px), (hover: none) and (pointer: coarse)" type="image/avif" srcSet="/images/3d/hero-lawn-phone.avif" width={750} height={250} />
            <source media="(max-width: 767px), (hover: none) and (pointer: coarse)" type="image/webp" srcSet="/images/3d/hero-lawn-phone.webp" width={750} height={250} />
            <source type="image/avif" srcSet="/images/3d/hero-lawn.avif" />
            {/* a pre-sized transparent still rendered from the 3D scene (next/image would only re-encode it) */}
            <img src="/images/3d/hero-lawn.webp" alt="" aria-hidden width={1600} height={584} decoding="async" fetchPriority="low" className="h-full w-full object-cover object-bottom" />
          </picture>
        )}
        {/* … the live scene fades in over it on a desktop with a mouse (on /v2, the 2D lawn on any desktop) … */}
        {flat ? (
          <canvas
            ref={flatCanvas}
            aria-hidden
            className={`hero-lawn-canvas pointer-events-none absolute inset-x-0 bottom-0 h-[58%] w-full transition-opacity duration-700 phone:hidden ${flatLive ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <canvas
            ref={lawnCanvas}
            aria-hidden
            className={`hero-lawn-canvas pointer-events-none absolute inset-x-0 bottom-0 hidden h-[58%] w-full transition-opacity duration-[1.4s] lg:block ${lawnLive ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {/* … and narrower desktops without 3D get the light 2D grass */}
        {Grass && <Grass mow={mow} className="pointer-events-none absolute inset-x-0 bottom-[4.4rem] h-[40%] w-full lg:bottom-0 lg:h-[44%]" />}
        <div aria-hidden className="hero-lawn-shade pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-forest/55 to-transparent" />

        <div className="hero-body wrap relative flex h-full flex-col justify-between pb-36 pt-[calc(var(--header-h)+1.5rem)] lg:pb-20">
          <h1 className="hero-head relative flex flex-1 flex-col justify-between pb-8">
            <span className={flat ? "hero-eyebrow t-eyebrow block text-lantern" : "hero-eyebrow t-eyebrow anim-fade block text-lantern"}>{biz.preview ? `Landscaping & lawn care · ${biz.area}` : "Landscaping & lawn care · Southlake, Texas"}</span>
            <span className={biz.area.length > 16 ? "hero-svc hero-svc-long" : "hero-svc"}>
              Landscaping in <span className="t-italic text-lantern">{biz.area}</span>
            </span>
            <span
              className={`hero-l1 t-mega ${flat ? "" : "anim-heading "}mt-4 block text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)] md:mt-6`}
              style={{ ["--d" as string]: "0.1s" }}
            >
              {biz.preview ? "Grown here." : "Grown for Texas."}
            </span>
            <span
              className={`hero-l2 t-mega ${flat ? "" : "anim-heading "}block text-right text-cream [text-shadow:0_2px_40px_rgba(22,36,28,0.35)]`}
              style={{ ["--d" as string]: "0.25s" }}
            >
              <span className="t-italic text-lantern">Kept</span> like home.
            </span>
          </h1>

          <div className={`hero-foot ${flat ? "" : "anim-fade "}flex flex-col gap-6 md:flex-row md:items-end md:justify-between`} style={{ ["--d" as string]: "0.5s" }}>
            <div className="hero-cta flex flex-wrap items-center gap-3">
              {tel && (
                <Button href={tel} variant="lantern" icon="phone" className="hero-call">
                  Call {biz.phoneDisplay}
                </Button>
              )}
              <Button href="/free-estimate" variant="light" className="hero-more">
                Get a free estimate
              </Button>
              <Button href="/lawn-plans" variant="ghost" className="hero-more bg-forest/45 text-cream backdrop-blur-md">
                Build a lawn plan
              </Button>
            </div>
            <div className="hero-facts flex flex-wrap items-center gap-3 text-cream/90">
              {biz.rating && (
                <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-forest/55 px-3 py-1.5 text-sm backdrop-blur-md">
                  <span className="text-lantern" aria-hidden>
                    ★★★★★
                  </span>
                  {biz.rating.value} · {biz.rating.count} Google reviews
                </Link>
              )}
              <OpenBadge className="bg-forest/55 backdrop-blur-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
