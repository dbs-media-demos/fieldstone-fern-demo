"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { agencyName, agencyUrl } from "@/content/site";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { PhoneIcon } from "@/components/ui/Button";
import { gsap, isPhone, isTouch, loadMotion, prefersReducedMotion } from "@/lib/gsap";

const noop = () => () => {};

/**
 * "Concept site by Scale by Noon ↗" pill, dismissible for the session. It floats at the right on
 * desktop (the mower starts on the left); on phones it sits in the page flow at the very end,
 * where it covers nothing at any scroll position and never meets the call bar.
 */
export function DemoPill() {
  const biz = useBiz();
  const stored = useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem("ff-demo-pill") === "0";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [closed, setClosed] = useState(false);
  if (stored || closed) return null;
  return (
    <div className="demo-pill fixed bottom-[5.4rem] right-3 z-40 flex items-center rounded-full bg-forest/92 text-cream shadow-lg shadow-black/20 backdrop-blur lg:bottom-4 lg:right-4">
      <a href={agencyUrl} className="inline-flex min-h-10 items-center gap-1.5 py-2 pl-4 pr-2 text-[0.8rem] tracking-[-0.005em]">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lantern" />
        {biz.preview ? (
          <span className="inline-block max-w-[15rem] truncate align-bottom sm:max-w-none">
            Preview for {biz.shortName} · by {agencyName} <span aria-hidden>↗</span>
          </span>
        ) : (
          <>
            Concept site by {agencyName} <span aria-hidden>↗</span>
          </>
        )}
      </a>
      <button
        type="button"
        aria-label="Dismiss concept site notice"
        onClick={() => {
          setClosed(true);
          try {
            sessionStorage.setItem("ff-demo-pill", "0");
          } catch {}
        }}
        className="mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/70 hover:text-cream phone:hidden"
      >
        ×
      </button>
    </div>
  );
}

/** Sticky bottom bar on phones: Call (showing the number) + Get a quote. On the home page the quote form is in the page itself. */
export function MobileBar() {
  const biz = useBiz();
  const pathname = usePathname();
  if (pathname === "/free-estimate") return null;
  const tel = telOf(biz);
  const home = pathname === "/" || pathname.startsWith("/for/");
  const quote = "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-terracotta font-medium text-cream";
  return (
    <div className="mobile-bar fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-cream p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden phone:block">
      <div className={clsx("grid gap-2", tel ? "grid-cols-[1.2fr_1fr]" : "grid-cols-1")}>
        {tel && (
          <a href={tel} aria-label={`Call ${biz.phoneDisplay}`} className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-forest/20 font-medium tabular-nums text-forest">
            <PhoneIcon /> {biz.phoneDisplay}
          </a>
        )}
        {home ? (
          <a href="#quote" className={quote}>
            Get a quote
          </a>
        ) : (
          <Link href="/free-estimate" className={quote}>
            Get a quote
          </Link>
        )}
      </div>
    </div>
  );
}

/** Soft custom cursor on desktop; grows into a "View" disc over [data-cursor] elements. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (isTouch() || isPhone() || prefersReducedMotion()) return;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    void loadMotion().then(() => {
      if (disposed) return;
      const el = dot.current!;
      el.style.display = "flex";
      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      const move = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
        setLabel(t ? t.dataset.cursor || "View" : null);
      };
      const leave = () => gsap.to(el, { opacity: 0, duration: 0.3 });
      const enter = () => gsap.to(el, { opacity: 1, duration: 0.3 });
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      document.documentElement.addEventListener("pointerenter", enter);
      cleanup = () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        document.documentElement.removeEventListener("pointerenter", enter);
      };
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      style={{ display: "none" }}
      className="pointer-events-none fixed left-0 top-0 z-[90] items-center justify-center"
    >
      <div
        className={clsx(
          "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color] duration-500 ease-[var(--ease-out-expo)]",
          label ? "h-24 w-24 bg-lantern text-forest" : "h-3 w-3 bg-lantern mix-blend-difference",
        )}
      >
        <span className={clsx("t-eyebrow transition-opacity duration-300", label ? "opacity-100" : "opacity-0")}>{label}</span>
      </div>
    </div>
  );
}
