"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/** Element starts below the fold (safe to hide for a reveal without hurting LCP). */
export const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

/**
 * Run non-urgent setup (scroll reveals below the fold) when the main thread is idle,
 * so dozens of components don't all measure layout during hydration.
 * Returns a cancel function.
 */
export function onIdle(cb: () => void, timeout = 900) {
  if (typeof window === "undefined") return () => {};
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}

/** SplitText is only needed once a headline scrolls into view, so it loads on demand. */
let splitTextPromise: Promise<typeof import("gsap/SplitText").SplitText> | null = null;
export function loadSplitText() {
  splitTextPromise ??= import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });
  return splitTextPromise;
}

export { gsap, ScrollTrigger, useGSAP };
