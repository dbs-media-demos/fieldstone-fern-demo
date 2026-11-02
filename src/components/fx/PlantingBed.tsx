"use client";

import { useRef, type CSSProperties } from "react";
import clsx from "clsx";
import { gsap, useGSAP, isTouch, prefersReducedMotion } from "@/lib/gsap";

/*
 * A planting bed drawn from maths (no images): fern fronds with lobed pinnae and a
 * fiddlehead curl, ornamental grass clumps and coneflowers. Geometry is computed once
 * at module load and rounded, so server and client markup match.
 */

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

// ── fern frond, drawn in a 360 × 900 box with its base at (250, 900) ──

const B: Pt[] = [
  [250, 900],
  [300, 600],
  [60, 430],
  [150, 150],
];
const bez = (t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * B[0][k] + 3 * u * u * t * B[1][k] + 3 * u * t * t * B[2][k] + t * t * t * B[3][k]) as Pt;
};
const tan = (t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (B[1][k] - B[0][k]) + 6 * u * t * (B[2][k] - B[1][k]) + 3 * t * t * (B[3][k] - B[2][k])) as Pt;
};

function crozier(): string {
  const [tx, ty] = B[3];
  const [dx, dy] = tan(1);
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const r0 = 34;
  const cx = tx + nx * r0;
  const cy = ty + ny * r0;
  const a0 = Math.atan2(ty - cy, tx - cx);
  const turns = Math.PI * 2 * 1.55;
  let d = "";
  for (let i = 1; i <= 48; i++) {
    const s = (i / 48) * turns;
    const r = r0 * (1 - (s / turns) * 0.86);
    d += ` L${r1(cx + Math.cos(a0 + s) * r)} ${r1(cy + Math.sin(a0 + s) * r)}`;
  }
  return d;
}

const STEM = `M${B[0][0]} ${B[0][1]} C${B[1].join(" ")} ${B[2].join(" ")} ${B[3].join(" ")}${crozier()}`;

function pinnaPath(L: number): string {
  // A tapering leaflet with scalloped edges: lobes lean toward the tip and stay joined.
  const m = Math.max(5, Math.round(L / 11));
  const s = L / m;
  const w = L * 0.16;
  const width = (x: number) => w * Math.sin(Math.PI * Math.min(1, 0.18 + (x / L) * 0.9)) * (1 - (x / L) * 0.35);
  let top = "M0 0";
  let bot = "";
  for (let i = 0; i < m; i++) {
    const x1 = (i + 1) * s;
    const wi = width(i * s + s * 0.6);
    top += ` Q${r1(i * s + s * 0.55)} ${r1(-wi * 1.2)} ${r1(x1)} ${r1(-width(x1) * 0.55)}`;
  }
  for (let i = m - 1; i >= 0; i--) {
    const x0 = i * s;
    const wi = width(x0 + s * 0.6);
    bot += ` Q${r1(x0 + s * 0.55)} ${r1(wi * 1.2)} ${r1(x0)} ${r1(i ? width(x0) * 0.55 : 0)}`;
  }
  return `${top} L${r1(L)} 0${bot}Z`;
}

type Pinna = { t: number; x: number; y: number; a: number; d: string; side: -1 | 1 };

const PINNAE: Pinna[] = (() => {
  const out: Pinna[] = [];
  const N = 15;
  for (let i = 0; i < N; i++) {
    const t = 0.1 + (i / (N - 1)) * 0.82;
    const [x, y] = bez(t);
    const [dx, dy] = tan(t);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    const L = 22 + 150 * (1 - t) * (t < 0.3 ? 0.55 + 1.5 * t : 1);
    for (const side of [-1, 1] as const) out.push({ t, x: r1(x), y: r1(y), a: r1(a + side * 62), d: pinnaPath(L), side });
  }
  return out;
})();

// ── the bed: plants stand on y = 300 in a 1000 × 300 box ──

const GROUND = 300;

type Plant =
  | { kind: "fern"; x: number; k: number; flip?: boolean }
  | { kind: "grass"; x: number; h: number }
  | { kind: "flower"; x: number; h: number; petal: string };

const BED: Plant[] = [
  { kind: "grass", x: 46, h: 146 },
  { kind: "fern", x: 150, k: 0.34 },
  { kind: "flower", x: 262, h: 193, petal: "var(--terracotta-2)" },
  { kind: "flower", x: 306, h: 137, petal: "var(--lantern)" },
  { kind: "grass", x: 392, h: 183 },
  { kind: "fern", x: 508, k: 0.25, flip: true },
  { kind: "flower", x: 598, h: 215, petal: "var(--terracotta-2)" },
  { kind: "grass", x: 688, h: 127 },
  { kind: "flower", x: 768, h: 156, petal: "var(--lantern)" },
  { kind: "grass", x: 862, h: 173 },
  { kind: "fern", x: 952, k: 0.30 },
];

// deterministic jitter so the bed looks planted by hand, not by a grid
const jit = (i: number, j: number) => {
  const v = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const grassBlades = (h: number, seed: number) =>
  Array.from({ length: 11 }, (_, j) => {
    const spread = (j / 10 - 0.5) * 2;
    const L = h * (0.55 + jit(seed, j) * 0.45) * (1 - Math.abs(spread) * 0.25);
    const dx = spread * h * 0.55 + (jit(seed, j + 20) - 0.5) * 14;
    return `M${r1(spread * 6)} 0 Q${r1(dx * 0.25)} ${r1(-L * 0.62)} ${r1(dx)} ${r1(-L)}`;
  });

const PETALS = 11;

/** Plant timing along the scroll: roughly left to right, never all at once. */
const startAt = (i: number) => r1((0.04 + (BED[i].x / 1000) * 0.42 + jit(i, 3) * 0.08) * 100) / 100;

function Fern({ x, k, flip, at }: { x: number; k: number; flip?: boolean; at: number }) {
  const sx = flip ? -k : k;
  return (
    <g transform={`translate(${r1(x - 250 * sx)} ${r1(GROUND - 900 * k)}) scale(${sx} ${k})`}>
      {PINNAE.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
          <path
            data-k="leaf"
            data-at={(at + p.t * 0.32).toFixed(3)}
            data-side={p.side}
            d={p.d}
            fill={i % 4 < 2 ? "var(--fern)" : "color-mix(in oklab, var(--fern) 76%, var(--moss))"}
          />
        </g>
      ))}
      <path data-k="draw" data-at={at} data-len={0.36} d={STEM} pathLength={1} fill="none" stroke="var(--fern)" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

function Grass({ x, h, at, seed }: { x: number; h: number; at: number; seed: number }) {
  return (
    <g transform={`translate(${x} ${GROUND})`} fill="none" stroke="var(--moss)" strokeWidth={2.4} strokeLinecap="round">
      {grassBlades(h, seed).map((d, j) => (
        <path key={j} data-k="draw" data-at={(at + jit(seed, j + 40) * 0.08).toFixed(3)} data-len={0.16} d={d} pathLength={1} />
      ))}
    </g>
  );
}

function Flower({ x, h, petal, at, seed }: { x: number; h: number; petal: string; at: number; seed: number }) {
  const lean = r1((jit(seed, 7) - 0.5) * 18);
  return (
    <g transform={`translate(${x} ${GROUND})`}>
      <path
        data-k="draw"
        data-at={at}
        data-len={0.2}
        d={`M0 0 Q${r1(lean * 0.2 + 6)} ${r1(-h * 0.5)} ${lean} ${-h}`}
        pathLength={1}
        fill="none"
        stroke="var(--fern)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      {[0.28, 0.5].map((f, j) => (
        <g key={j} transform={`translate(${r1(lean * f * 0.5 + 3)} ${r1(-h * f)}) rotate(${j ? 200 : -20})`}>
          <path
            data-k="leaf"
            data-at={(at + 0.06 + j * 0.04).toFixed(3)}
            data-side={j ? 1 : -1}
            d="M0 0 Q16 -9 34 0 Q16 9 0 0Z"
            fill="color-mix(in oklab, var(--fern) 80%, var(--moss))"
          />
        </g>
      ))}
      <g transform={`translate(${lean} ${-h})`}>
        <g data-k="pop" data-at={(at + 0.17).toFixed(3)}>
          {Array.from({ length: PETALS }, (_, j) => (
            <path key={j} d="M0 2 Q5 12 1 24 Q-4 12 0 2Z" fill={petal} transform={`rotate(${r1((j / PETALS) * 300 - 150)})`} />
          ))}
          <ellipse cx={0} cy={-1} rx={8} ry={7} fill="#5a2e1a" />
        </g>
      </g>
    </g>
  );
}

/**
 * "The garden we plant": a border of plants grows out of the stats' top line as you
 * scroll. Stems and grass blades draw upward, leaves unfold from the stem, flower
 * heads pop open, and each fern's fiddlehead curls last. Grown plants sway; on
 * desktop they lean away from the cursor. Reduced motion: the grown bed, still.
 */
export function PlantingBed({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);
      const at = (n: Element) => Number((n as SVGElement).dataset.at ?? 0);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 96%", end: "bottom 45%", scrub: 0.8 },
      });
      q<SVGPathElement>("[data-k=draw]").forEach((p) => {
        gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
        tl.to(p, { strokeDashoffset: 0, duration: Number(p.dataset.len ?? 0.2) }, at(p));
      });
      q<SVGPathElement>("[data-k=leaf]").forEach((p) => {
        gsap.set(p, { scale: 0, rotation: Number(p.dataset.side ?? 1) * -55, transformOrigin: "0% 50%" });
        tl.to(p, { scale: 1, rotation: 0, duration: 0.1, ease: "back.out(1.6)" }, at(p));
      });
      q<SVGGElement>("[data-k=pop]").forEach((g) => {
        gsap.set(g, { scale: 0, rotation: -90, transformOrigin: "50% 50%" });
        tl.to(g, { scale: 1, rotation: 0, duration: 0.12, ease: "back.out(2.2)" }, at(g));
      });

      if (isTouch()) return;
      const svg = el.querySelector("svg")!;
      const host = el.closest("section") ?? el;
      const lean = q<SVGGElement>(".bed-lean").map((g, i) => {
        gsap.set(g, { svgOrigin: `${BED[i].x} ${GROUND}` });
        return gsap.quickTo(g, "rotation", { duration: 1.1, ease: "elastic.out(1, 0.4)" });
      });
      const move = (e: PointerEvent) => {
        const m = svg.getScreenCTM();
        if (!m) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        BED.forEach((pl, i) => {
          const dx = pl.x - p.x;
          const near = p.y > -60 && p.y < GROUND + 40 ? Math.max(0, 1 - Math.abs(dx) / 140) : 0;
          lean[i](Math.sign(dx || 1) * near * near * 14);
        });
      };
      const leave = () => lean.forEach((f) => f(0));
      host.addEventListener("pointermove", move as EventListener);
      host.addEventListener("pointerleave", leave);
      return () => {
        host.removeEventListener("pointermove", move as EventListener);
        host.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className={clsx("pointer-events-none", className)}>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="xMinYMax meet" className="h-full w-full overflow-visible">
        {BED.map((pl, i) => (
          <g key={i} className="bed-lean">
            <g
              className="bed-sway"
              style={{ "--sway-d": `${(5 + jit(i, 9) * 3).toFixed(2)}s`, "--sway-delay": `${(-jit(i, 5) * 6).toFixed(2)}s` } as CSSProperties}
            >
              {pl.kind === "fern" ? (
                <Fern x={pl.x} k={pl.k} flip={pl.flip} at={startAt(i)} />
              ) : pl.kind === "grass" ? (
                <Grass x={pl.x} h={pl.h} at={startAt(i)} seed={i} />
              ) : (
                <Flower x={pl.x} h={pl.h} petal={pl.petal} at={startAt(i)} seed={i} />
              )}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
