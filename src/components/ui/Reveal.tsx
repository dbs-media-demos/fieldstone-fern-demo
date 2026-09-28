"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import type { SplitText } from "gsap/SplitText";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, belowFold, onIdle, loadSplitText } from "@/lib/gsap";

/*
 * Scroll-driven reveals. Content is always present and visible in the HTML;
 * `immediate` variants (top of page) animate with CSS only, so they paint at
 * once for LCP. JS hides elements only while they are still below the fold.
 * Setup is deferred to idle time (onIdle) so reveals never block hydration.
 */

const delayStyle = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

type SplitProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
  stagger?: number;
  id?: string;
};

/** Headline that rises line by line out of a mask as it scrolls into view. */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, immediate, stagger = 0.1, id }: SplitProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion()) return;
      let split: SplitText | null = null;
      let io: IntersectionObserver | null = null;
      let disposed = false;
      const cancel = onIdle(
        contextSafe!(() => {
          if (!belowFold(el)) return;
          gsap.set(el, { opacity: 0 });
          const ready = loadSplitText(); // start fetching now so it's ready on enter
          io = new IntersectionObserver(
            ([entry]) => {
              if (!entry.isIntersecting) return;
              io?.disconnect();
              ready
                .then(
                  contextSafe!((ST: typeof SplitText) => {
                    if (disposed) return;
                    split = ST.create(el, {
                      type: "lines",
                      mask: "lines",
                      linesClass: "split-line",
                      autoSplit: true,
                      onSplit(self) {
                        gsap.set(el, { opacity: 1 });
                        return gsap.from(self.lines, { yPercent: 118, rotate: 2, duration: 1.3, stagger, delay, ease: "expo.out" });
                      },
                    });
                  }),
                )
                .catch(() => gsap.set(el, { opacity: 1 }));
            },
            { rootMargin: "0px 0px -8% 0px" },
          );
          io.observe(el);
        }),
      );
      return () => {
        disposed = true;
        cancel();
        io?.disconnect();
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-heading", className)} style={immediate ? delayStyle(delay) : undefined}>
      {children}
    </Tag>
  );
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  immediate?: boolean;
  id?: string;
  "aria-label"?: string;
};

/** Fade + rise when scrolled into view. `stagger` animates direct children. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 36, stagger, immediate, id, "aria-label": ariaLabel }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion()) return;
      return onIdle(
        contextSafe!(() => {
          if (!belowFold(el)) return;
          const targets = stagger ? Array.from(el.children) : [el];
          gsap.set(targets, { opacity: 0, y });
          ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () =>
              gsap.to(targets, { opacity: 1, y: 0, duration: 1.2, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "transform" }),
          });
        }),
      );
    },
    { scope: ref },
  );

  return (
    <Tag
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className={clsx(immediate && "anim-fade", className)}
      style={immediate ? delayStyle(delay) : undefined}
    >
      {children}
    </Tag>
  );
}

/** Paragraph whose words brighten one by one as you scroll through it. */
export function ScrubWords({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      return onIdle(
        contextSafe!(() => {
          const words = el.querySelectorAll<HTMLElement>("[data-w]");
          gsap.fromTo(
            words,
            { opacity: 0.5 },
            { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.6 } },
          );
        }),
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className="inline">
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Image frame that unmasks (arch or inset) on enter and drifts with scroll.
 * The first child should be the image layer (absolute/fill).
 */
export function Parallax({
  children,
  className,
  amount = 12,
  reveal = "inset",
  style,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  reveal?: "inset" | "arch" | "none";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner || prefersReducedMotion()) return;
      return onIdle(
        contextSafe!(() => {
          if (amount) {
            gsap.set(inner, { scale: 1 + amount / 100 });
            gsap.fromTo(
              inner,
              { yPercent: -amount / 2 },
              { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
            );
          }
          if (reveal !== "none" && belowFold(el)) {
            const from = reveal === "arch" ? "inset(22% 14% 0% 14% round 999px 999px 24px 24px)" : "inset(10% 7% 10% 7% round 28px)";
            const to = reveal === "arch" ? "inset(0% 0% 0% 0% round 999px 999px 24px 24px)" : "inset(0% 0% 0% 0% round 0px)";
            gsap.fromTo(
              el,
              { clipPath: from },
              { clipPath: to, duration: 1.7, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } },
            );
          }
        }),
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={clsx("relative overflow-hidden", className)} style={style}>
      {children}
    </div>
  );
}

/** Number that counts up when it scrolls into view. */
export function Counter({ value, decimals = 0, suffix = "", className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      return onIdle(
        contextSafe!(() => {
          if (!belowFold(el)) return;
          const obj = { n: 0 };
          el.textContent = fmt(0) + suffix;
          ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () =>
              gsap.to(obj, {
                n: value,
                duration: 2.2,
                ease: "power3.out",
                onUpdate: () => {
                  el.textContent = fmt(obj.n) + suffix;
                },
              }),
          });
        }),
      );
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={clsx("tabular-nums", className)}>
      {fmt(value)}
      {suffix}
    </span>
  );
}
