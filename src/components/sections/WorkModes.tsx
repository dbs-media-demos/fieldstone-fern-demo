"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { gsap, useGSAP, isTouch, prefersReducedMotion } from "@/lib/gsap";

const BANDS = 10;
const DAYS = ["M", "T", "W", "T", "F"];

/**
 * "Two ways we work". Both cards act out their service as they scroll into view:
 * the weekly card's lawn gets mowed into stripes, band by band in a serpentine,
 * while the week's day marker slides to Thursday (your day); the projects card
 * starts as a blueprint that draws itself, then opens from the fire pit into the
 * finished patio. On desktop the cards tilt toward the cursor and, on hover, the
 * stripes brighten and the plan ghosts back over the build.
 * Server render / reduced motion: plain photos.
 */
export function WorkModes() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);

      // Weekly card: serpentine mowing passes + day marker
      const lawn = q(".wm-lawn")[0];
      if (lawn) {
        const bands = q(".wm-band");
        const marker = q(".wm-marker")[0];
        const days = q(".wm-day");
        gsap.set(bands, { clipPath: (i: number) => (i % 2 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)") });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: lawn.closest("a"), start: "top 88%", end: "center 52%", scrub: 0.6 },
        });
        bands.forEach((b, i) => tl.to(b, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, i));
        tl.fromTo(marker, { x: 0 }, { x: () => (days[3] as HTMLElement).offsetLeft, duration: BANDS, ease: "power1.inOut" }, 0);
        tl.to(days[3], { color: "#16241c", duration: 0.6 }, BANDS - 0.6);
      }

      // Projects card: blueprint draws, then the build opens from the fire pit
      const bp = q(".wm-bp")[0];
      if (bp) {
        const lines = q(".wm-bp .wm-line");
        const labels = q(".wm-bp .wm-label");
        gsap.set(bp, { autoAlpha: 1, "--r": "0%" });
        gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(labels, { opacity: 0 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: bp.closest("a"), start: "top 88%", end: "center 52%", scrub: 0.6 },
        });
        tl.to(lines, { strokeDashoffset: 0, duration: 0.3, stagger: 0.025 }, 0)
          .to(labels, { opacity: 1, duration: 0.1, stagger: 0.04 }, 0.3)
          .to(bp, { "--r": "150%", duration: 0.5, ease: "power2.in" }, 0.6)
          .to(".wm-bp svg", { opacity: 0, duration: 0.25 }, 0.85);
      }

      if (isTouch()) return;
      const cards = q<HTMLElement>(".wm-card");
      const offs = cards.map((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
        gsap.set(card, { transformPerspective: 1100 });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        };
      });
      return () => offs.forEach((off) => off());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-14 grid gap-5 md:grid-cols-2 phone:!flex phone-swipe [--card:80vw]">
      <Card
        i={0}
        href="/lawn-plans"
        img="crew-mowing"
        k="Recurring"
        t="Weekly lawn care"
        d="Same crew, same day, a text before we arrive. From $45 a visit."
        overlay={<MowedLawn />}
      />
      <Card
        i={1}
        href="/services/landscape-design"
        img="patio-firepit-house"
        k="Design & build"
        t="Landscape projects"
        d="Consult, 3D design, install, care plan. Patios, kitchens, lighting, planting."
        overlay={<Blueprint />}
      />
    </div>
  );
}

function Card({ i, href, img, k, t, d, overlay }: { i: number; href: string; img: string; k: string; t: string; d: string; overlay: ReactNode }) {
  return (
    <Reveal delay={i * 0.1}>
      <Link
        href={href}
        data-cursor="Explore"
        className="wm-card group relative block aspect-[4/5] overflow-hidden rounded-[2rem] [transform-style:preserve-3d] sm:aspect-[5/4] phone:!aspect-[3/2] phone:rounded-[1.25rem]"
      >
        <Photo slug={img} sizes="(min-width: 768px) 50vw, 80vw" className="transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" />
        {overlay}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-cream sm:p-9 phone:!gap-2 phone:!p-3.5">
          <div>
            <p className="t-eyebrow text-lantern">{k}</p>
            <h3 className="t-h3 mt-3 phone:!mt-1">{t}</h3>
            <p className="mt-3 max-w-sm text-cream/80 phone:!mt-1 phone:!text-[0.85rem] phone:!leading-snug">{d}</p>
          </div>
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream text-forest transition-transform duration-500 group-hover:rotate-[-45deg] phone:hidden">
            <Arrow />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/** Stripes laid on the photo's lawn in perspective; each band is one mower pass. */
function MowedLawn() {
  return (
    <>
      <div
        aria-hidden
        className="wm-lawn pointer-events-none absolute inset-x-[-30%] bottom-0 h-[62%] opacity-80 transition-opacity duration-700 [perspective:640px] group-hover:opacity-100"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)" }}
      >
        <div className="absolute inset-0 flex origin-bottom [transform:rotateX(56deg)]">
          {Array.from({ length: BANDS }, (_, i) => (
            <span key={i} className={i % 2 ? "wm-band h-full flex-1 bg-[rgba(8,26,12,0.26)]" : "wm-band h-full flex-1 bg-[rgba(236,248,196,0.24)]"} />
          ))}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute left-7 top-7 sm:left-9 sm:top-9 phone:!left-3.5 phone:!top-3.5">
        <div className="relative flex gap-1.5">
          <span className="wm-marker absolute left-0 top-0 h-8 w-8 rounded-full bg-lantern" />
          {DAYS.map((day, i) => (
            <span
              key={i}
              className="wm-day relative flex h-8 w-8 items-center justify-center rounded-full border border-cream/45 font-mono text-[11px] text-cream backdrop-blur-[2px] phone:backdrop-blur-none"
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/** A patio plan, drawn in the studio's hand, that opens into the finished build. */
function Blueprint() {
  return (
    <>
    <div
      aria-hidden
      className="wm-bp pointer-events-none invisible absolute inset-0"
      style={{
        backgroundColor: "#1a2b22",
        backgroundImage:
          "linear-gradient(rgba(233,220,192,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(233,220,192,0.08) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(circle at 46% 64%, transparent var(--r, 0%), #000 calc(var(--r, 0%) + 0.5%))",
        WebkitMaskImage: "radial-gradient(circle at 46% 64%, transparent var(--r, 0%), #000 calc(var(--r, 0%) + 0.5%))",
      }}
    >
      <BlueprintLines />
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-45">
      <BlueprintLines />
    </div>
    </>
  );
}

function BlueprintLines() {
  const chairs = [-150, -95, -30, 30, 95, 150];
  const cx = 230;
  const cy = 255;
  return (
    <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" fill="none" stroke="#eadfc4" strokeLinecap="round">
      <g strokeWidth={2.2}>
        <path className="wm-line" pathLength={1} d="M18 30 H320 V150 H486" />
        <path className="wm-line" pathLength={1} d="M70 150 H300 M110 150 V140 M260 150 V140" strokeWidth={1.2} />
      </g>
      <g strokeWidth={1.4}>
        <path className="wm-line" pathLength={1} d="M60 168 H400 V372 H60 Z" />
        <path className="wm-line" pathLength={1} d="M60 220 H400 M60 272 H400 M60 324 H400 M145 168 V372 M315 168 V372" strokeOpacity={0.35} strokeWidth={0.8} />
        <path className="wm-line" pathLength={1} d={`M${cx - 30} ${cy - 30} h60 v60 h-60 Z`} />
        <path className="wm-line" pathLength={1} d={`M${cx} ${cy - 20} a20 20 0 1 1 -0.1 0`} stroke="#e8b45a" />
        {chairs.map((a) => {
          const r = 78;
          const x = cx + Math.sin((a * Math.PI) / 180) * r;
          const y = cy - Math.cos((a * Math.PI) / 180) * r * 0.85;
          return (
            <path
              key={a}
              className="wm-line"
              pathLength={1}
              d={`M${(x - 11).toFixed(1)} ${(y - 9).toFixed(1)} h22 v18 h-22 Z`}
              transform={`rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})`}
            />
          );
        })}
        <path className="wm-line" pathLength={1} d="M412 392 C430 320 452 270 500 240" stroke="#b9c2a4" />
        <path className="wm-line" pathLength={1} d="M448 112 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 M448 97 v30 M433 112 h30" stroke="#b9c2a4" />
        <path className="wm-line" pathLength={1} d="M462 322 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0" stroke="#b9c2a4" />
        <path className="wm-line" pathLength={1} d="M30 205 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0" stroke="#b9c2a4" />
        <path className="wm-line" pathLength={1} d="M60 388 H400 M60 382 V394 M400 382 V394" strokeWidth={1} />
        <path className="wm-line" pathLength={1} d="M466 34 l8 22 l-8 -6 l-8 6 Z" strokeWidth={1} />
      </g>
      <g fill="#eadfc4" stroke="none" fontFamily="var(--font-mono)" fontSize={9} letterSpacing={1.5}>
        <text className="wm-label" x={230} y={384} textAnchor="middle">
          34&apos;-0&quot;
        </text>
        <text className="wm-label" x={74} y={186}>
          FLAGSTONE PATIO
        </text>
        <text className="wm-label" x={cx} y={cy + 48} textAnchor="middle" fill="#e8b45a">
          FIRE PIT
        </text>
        <text className="wm-label" x={472} y={70} textAnchor="middle">
          N
        </text>
        <text className="wm-label" x={24} y={22}>
          PLAN · SHEET L-1
        </text>
      </g>
    </svg>
  );
}
