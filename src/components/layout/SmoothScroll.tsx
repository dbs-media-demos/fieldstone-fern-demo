"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, PHONE_QUERY, belowFold, hasMotion, isPhone, isTouch, loadMotion, prefersReducedMotion } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Desktop: Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Phones: native scrolling, and one small fade-and-rise per section.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isTouch() || isPhone()) return;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    void Promise.all([import("lenis"), loadMotion()]).then(([{ default: LenisCtor }]) => {
      if (disposed) return;
      const lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -80 } });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete window.__lenis;
      };
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  // A window dragged across the phone line reloads into the other version (scenes are set up once).
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const reload = () => window.location.reload();
    mq.addEventListener("change", reload);
    return () => mq.removeEventListener("change", reload);
  }, []);

  useEffect(() => {
    if (isPhone()) return;
    window.__lenis?.resize();
    // Re-measure once the new layout settles, and again after idle-created reveals exist.
    const refresh = () => {
      if (!hasMotion()) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    const a = window.setTimeout(refresh, 350);
    const b = window.setTimeout(refresh, 2000);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [pathname]);

  // Phones: each section's content fades and rises once as it arrives (transform and opacity only).
  useEffect(() => {
    if (!isPhone() || prefersReducedMotion()) return;
    const els = [...document.querySelectorAll<HTMLElement>("main section > .wrap, main [data-rise]")].filter(belowFold);
    els.forEach((el) => el.classList.add("rise-wait"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          e.target.classList.add("rise-in");
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
