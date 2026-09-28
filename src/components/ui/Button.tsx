"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import { gsap, isTouch, prefersReducedMotion } from "@/lib/gsap";

type Variant = "primary" | "ghost" | "light" | "lantern";

const styles: Record<Variant, string> = {
  primary: "bg-terracotta text-cream hover:bg-[#8e3b23]",
  ghost: "border border-current/30 text-current hover:bg-current/[0.06]",
  light: "bg-cream text-forest hover:bg-white",
  lantern: "bg-lantern text-forest hover:bg-[#f0c472]",
};

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={clsx("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={clsx("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

/** Pill link with a gentle magnetic pull on desktop. */
export function Button({
  href,
  children,
  variant = "primary",
  className,
  icon = "arrow",
  magnetic = true,
  onClick,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: "arrow" | "phone" | "none";
  magnetic?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !magnetic || isTouch() || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.32;
    gsap.to(el, { x, y, duration: 0.6, ease: "power3.out" });
  };
  const leave = () => ref.current && gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });

  const cls = clsx(
    "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[0.98rem] font-medium tracking-[-0.01em] transition-colors duration-300",
    styles[variant],
    className,
  );
  const inner = (
    <>
      {icon === "phone" && <PhoneIcon />}
      <span>{children}</span>
      {icon === "arrow" && (
        <span className="relative inline-flex h-4 w-4 overflow-hidden">
          <Arrow className="absolute transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-5" />
          <Arrow className="absolute -translate-x-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0" />
        </span>
      )}
    </>
  );

  const external = /^(tel:|sms:|mailto:|https?:)/.test(href);
  if (external)
    return (
      <a ref={ref} href={href} className={cls} onPointerMove={move} onPointerLeave={leave} onClick={onClick} {...rest}>
        {inner}
      </a>
    );
  return (
    <Link ref={ref} href={href} className={cls} onPointerMove={move} onPointerLeave={leave} onClick={onClick} {...rest}>
      {inner}
    </Link>
  );
}
