"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { nav, site, telHref } from "@/content/site";
import { services } from "@/content/services";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function Header() {
  const pathname = usePathname();
  // top: transparent over the hero · dark: over a dark section · light: over a light section
  const [mode, setMode] = useState<"top" | "dark" | "light">("top");
  const headerRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const y = window.scrollY;
      const probeY = (headerRef.current?.offsetHeight ?? 76) + 1;
      const under = document
        .elementsFromPoint(window.innerWidth / 2, probeY)
        .find((el) => !headerRef.current?.contains(el) && !el.closest("#site-menu"));
      const dark = !!under?.closest(".theme-forest, .theme-fern");
      setMode(y < 40 ? "top" : dark ? "dark" : "light");
      setHidden(y > 400 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close the menu on navigation (adjust state during render, no effect needed).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (open) {
      window.__lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      if (!prefersReducedMotion()) {
        gsap.fromTo(el, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 1, ease: "expo.inOut" });
        gsap.fromTo(el.querySelectorAll("[data-m]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.05, delay: 0.25, ease: "expo.out" });
      }
      const first = el.querySelector<HTMLElement>("a");
      first?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggleRef.current?.focus();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    } else {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  const solid = mode === "light" && !open;
  const tinted = mode === "dark" && !open;

  return (
    <>
      <header
        ref={headerRef}
        style={{ viewTransitionName: "site-header" }}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          solid && "bg-cream/88 text-forest shadow-[0_1px_0_rgba(22,36,28,0.08)] backdrop-blur-xl",
          tinted && "bg-forest/55 text-cream backdrop-blur-xl",
          !solid && !tinted && "text-cream",
        )}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" aria-label={`${site.legalName}, home`} className="relative z-10">
            <Logo animate className={clsx(solid ? "[--accent:var(--terracotta)]" : "[--accent:var(--lantern)]")} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className="group relative inline-flex h-11 items-center px-3.5 text-[0.95rem]"
                    >
                      {n.label}
                      <span
                        aria-hidden
                        className={clsx(
                          "absolute inset-x-3.5 bottom-2 h-px origin-left bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <a href={telHref} className="hidden h-11 items-center gap-2 px-3 text-[0.95rem] xl:inline-flex">
              <PhoneIcon />
              {site.phoneDisplay}
            </a>
            <span className="hidden sm:block">
              <Button href="/free-estimate" variant={solid ? "primary" : "light"} className="!min-h-11 !px-5">
              Free estimate
            </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={clsx(
                "relative inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden",
                open ? "text-cream" : "",
              )}
            >
              <span aria-hidden className={clsx("absolute h-px w-5 bg-current transition-transform duration-500", open ? "rotate-45" : "-translate-y-[4px]")} />
              <span aria-hidden className={clsx("absolute h-px w-5 bg-current transition-transform duration-500", open ? "-rotate-45" : "translate-y-[4px]")} />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="theme-forest fixed inset-0 z-[46] overflow-y-auto lg:hidden"
        data-lenis-prevent
      >
        <div className="absolute inset-0 opacity-25">
          <Photo slug="garden-night-glow" sizes="100vw" decorative />
        </div>
        <div className="wrap relative flex min-h-full flex-col justify-between gap-10 pb-10 pt-[calc(var(--header-h)+2rem)]">
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/free-estimate", label: "Free estimate" }].map((n) => (
                <li key={n.href} className="overflow-hidden">
                  <Link data-m href={n.href} className="font-display block py-1 text-[2.6rem] leading-[1.05] tracking-[-0.03em]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-6 text-muted">
            <ul className="flex flex-wrap gap-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-fg">
                    {s.short}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={telHref} className="font-display text-3xl text-lantern">
              {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
