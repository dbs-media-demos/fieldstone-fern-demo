"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

/** Phones: below 768 px or touch. Same rule as the `phone:` CSS variant in globals.css. */
export const PHONE_QUERY = "(max-width: 767px), (hover: none) and (pointer: coarse)";

export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/*
 * GSAP and ScrollTrigger live in their own chunk (lib/gsap-core), fetched straight away on
 * desktop and never on phones. These bindings stay undefined until it has loaded, so code outside
 * useGSAP checks hasMotion() first.
 */
type Core = typeof import("./gsap-core");
export let gsap = undefined as unknown as Core["gsap"];
export let ScrollTrigger = undefined as unknown as Core["ScrollTrigger"];

let ready: Promise<void> | null = null;
export function loadMotion() {
  ready ??= import("./gsap-core").then((m) => {
    gsap = m.gsap;
    ScrollTrigger = m.ScrollTrigger;
  });
  return ready;
}
if (typeof window !== "undefined" && !isPhone()) void loadMotion();

export const hasMotion = () => !!gsap;

const useIsoLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- same signature as @gsap/react
type ContextSafe = <T extends Function>(fn: T) => T;
type SceneFn = (context: gsap.Context, contextSafe: ContextSafe) => void | (() => void);

/**
 * The @gsap/react hook, minus the static import: a scene set up once on mount inside a
 * gsap.context and reverted on unmount. It never runs on phones: what's on the page is the
 * finished state, and the page stays still.
 */
export function useGSAP(scene: SceneFn, { scope }: { scope: RefObject<Element | null> }) {
  // Once on mount, like useGSAP without dependencies
  useIsoLayoutEffect(() => {
    if (isPhone()) return;
    let context: gsap.Context | null = null;
    let disposed = false;
    const run = () => {
      if (disposed) return;
      context = gsap.context(() => {}, scope);
      context.add(scene as unknown as () => void, scope);
    };
    if (gsap) run();
    else void loadMotion().then(run);
    return () => {
      disposed = true;
      context?.revert();
    };
  }, []);
}

/** A small tween for phones, where GSAP isn't loaded: reports eased progress 0 → 1. Returns a cancel function. */
export function rafTween(seconds: number, onUpdate: (t: number) => void) {
  const start = performance.now();
  let id = 0;
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / (seconds * 1000));
    onUpdate(1 - Math.pow(1 - t, 3));
    if (t < 1) id = requestAnimationFrame(frame);
  };
  id = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(id);
}

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
