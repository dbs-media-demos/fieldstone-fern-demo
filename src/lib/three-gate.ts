"use client";

/**
 * The only door to three.js. Nothing imports a 3D module statically: callers run `after3DGate`
 * in an effect, and the `import()` happens inside its callback, so phones, tablets, reduced
 * motion and Save-Data never download a byte of it.
 */
export const DESKTOP_3D_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const STILL_KEY = "fnf-3d";

/** A scene ran slow (or there is no proper GPU): every 3D scene stays a still for the rest of the visit. */
export function is3DDemoted() {
  try {
    return sessionStorage.getItem(STILL_KEY) === "still";
  } catch {
    return false;
  }
}

export function demote3D() {
  try {
    sessionStorage.setItem(STILL_KEY, "still");
  } catch {}
}

export function can3D() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia(DESKTOP_3D_QUERY).matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return typeof WebGL2RenderingContext !== "undefined";
}

const whenIdle = (timeout: number) =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout }) : window.setTimeout(r, 120)));

/**
 * After the page has loaded (and the browser has had a breath), call `yes` on a big screen with a
 * mouse, otherwise `no`. A visit already demoted to stills calls neither: the still stays.
 * Returns a cancel function.
 */
export function after3DGate(yes: () => void, no?: () => void) {
  let cancelled = false;
  const run = () => {
    if (cancelled || is3DDemoted()) return;
    if (can3D()) yes();
    else no?.();
  };
  const onLoad = () => void whenIdle(600).then(run);
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", onLoad);
  };
}

/**
 * Scenes warm up one at a time, each in the browser's idle time once the one before it has settled
 * (built, compiled, first frame drawn, first seconds watched), so the hero never hitches while the
 * scene further down is being built. A task that throws or hangs never blocks the next for long.
 */
let chain: Promise<void> = Promise.resolve();
export function queue3D(task: () => Promise<void>, maxWait = 6000) {
  const run = chain.then(async () => {
    await whenIdle(1500);
    if (is3DDemoted()) return;
    await Promise.race([task().catch(() => {}), new Promise((r) => setTimeout(r, maxWait))]);
  });
  chain = run;
  return run;
}
