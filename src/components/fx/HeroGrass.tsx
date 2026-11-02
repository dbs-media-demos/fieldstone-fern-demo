"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Blade = {
  x: number;
  wild: number; // full height when uncut
  cut: number; // height after the mower
  w: number;
  lean: number;
  ph: number;
  tone: number; // 0 back layer, 1–3 front colours
  band: number; // mowing stripe: 0 light, 1 dark
  delay: number;
  cur: number;
  bend: number;
  vel: number;
};

type Clip = { x: number; y: number; vx: number; vy: number; r: number; vr: number; life: number; max: number; l: number; c: string };

// Golden-hour meadow: dark bases, moss and dry-gold tips. Mowed stripes: two greens.
const WILD = [
  ["#3a5236", "#1d2f25", "#101a14"],
  ["#93a35e", "#3b5737", "#111c16"],
  ["#c9b46a", "#56693a", "#14211a"],
  ["#7f9150", "#2f4a34", "#0f1913"],
];
const STRIPE = [
  ["#a9bb72", "#5b7a40", "#1a2a1f"],
  ["#5f7d42", "#33502f", "#121e17"],
];
const CLIP_COLORS = ["#7f9a48", "#a7bb6a", "#5d7a3c", "#c9b46a"];

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/**
 * Hero foreground: a fringe of wild grass that grows in on load, sways in the wind
 * and parts around the pointer (or a finger). `mow.p` (0 → 1, driven by the hero's
 * scroll scene) rolls a mower across, cutting the meadow into a neat striped lawn;
 * scrolling back lets it grow again. Reduced motion: one still frame of grown grass.
 */
export function HeroGrass({ mow, className }: { mow: RefObject<{ p: number }>; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const host = cv.parentElement!;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let W = 0;
    let H = 0;
    let mobile = false;
    let cutH = 0;
    let bandW = 0;
    let blades: Blade[] = [];
    let wildGrad: CanvasGradient[] = [];
    let stripeGrad: CanvasGradient[] = [];
    const clips: Clip[] = [];
    const t0 = performance.now();
    let lastP = 0;
    let visible = true;
    const ptr = { x: -9999, y: -9999, vx: 0, on: false, idle: 0 };

    const build = () => {
      const r = cv.getBoundingClientRect();
      const grown = performance.now() - t0 > 3200;
      W = r.width;
      H = r.height;
      mobile = W < 768;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const n = Math.min(720, Math.round(W / (mobile ? 2.3 : 2.1)));
      const tall = mobile ? 0.5 : 0.62;
      cutH = Math.max(18, H * (mobile ? 0.11 : 0.1));
      bandW = mobile ? 46 : 74;
      blades = Array.from({ length: n }, (_, i) => {
        const x = ((i + Math.random()) / n) * (W + 24) - 12;
        const back = Math.random() < 0.38;
        const wild = H * (back ? 0.22 + Math.random() * 0.3 : 0.12 + Math.pow(Math.random(), 1.5) * tall) * (Math.random() < 0.04 ? 1.35 : 1);
        return {
          x,
          wild,
          cut: cutH * (0.85 + Math.random() * 0.3),
          w: (back ? 3 : 4) + Math.random() * (mobile ? 3 : 4.5),
          lean: (Math.random() - 0.5) * 0.5,
          ph: Math.random() * Math.PI * 2,
          tone: back ? 0 : 1 + Math.floor(Math.random() * 3),
          band: Math.floor(Math.max(0, x) / bandW) % 2,
          delay: grown ? 0 : 0.25 + (x / W) * 0.75 + Math.random() * 0.35,
          cur: grown ? wild : 0,
          bend: 0,
          vel: 0,
        };
      });
      // back layer first, so the brighter front blades overlap it
      blades.sort((a, b) => (a.tone === 0 ? 0 : 1) - (b.tone === 0 ? 0 : 1));
      const grad = (top: number, stops: string[]) => {
        const g = ctx.createLinearGradient(0, top, 0, H);
        g.addColorStop(0, stops[0]);
        g.addColorStop(0.45, stops[1]);
        g.addColorStop(1, stops[2]);
        return g;
      };
      wildGrad = WILD.map((s) => grad(H * (1 - tall * 1.1), s));
      stripeGrad = STRIPE.map((s) => grad(H - cutH * 1.25, s));
    };

    const blade = (b: Blade, h: number, tilt: number) => {
      const tipX = b.x + tilt * h * 0.75;
      const tipY = H - h * (1 - Math.min(0.45, Math.abs(tilt) * 0.3));
      const cx = b.x + tilt * h * 0.18;
      const cy = H - h * 0.55;
      ctx.moveTo(b.x - b.w / 2, H + 1);
      ctx.quadraticCurveTo(cx - b.w * 0.18, cy, tipX, tipY);
      ctx.quadraticCurveTo(cx + b.w * 0.18, cy, b.x + b.w / 2, H + 1);
    };

    const drawMower = (x: number, t: number) => {
      const s = mobile ? 0.8 : 1.05;
      const y = H + Math.sin(t * 38) * 0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      // handle
      ctx.strokeStyle = "#f3ede1";
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, -24);
      ctx.lineTo(-44, -66);
      ctx.lineTo(-52, -66);
      ctx.stroke();
      // deck + engine
      ctx.fillStyle = "#a3472c";
      ctx.beginPath();
      ctx.roundRect(-28, -24, 54, 15, 6);
      ctx.fill();
      ctx.fillStyle = "#e2d5bc";
      ctx.beginPath();
      ctx.roundRect(-13, -35, 24, 12, 5);
      ctx.fill();
      // wheels
      for (const wx of [-17, 15]) {
        ctx.fillStyle = "#101a14";
        ctx.beginPath();
        ctx.arc(wx, -7, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e8b45a";
        ctx.beginPath();
        ctx.arc(wx, -7, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const spray = (x: number, n: number) => {
      for (let i = 0; i < n; i++) {
        clips.push({
          x: x - 26 + Math.random() * 8,
          y: H - 14 - Math.random() * 6,
          vx: -1.5 - Math.random() * 3.5,
          vy: -2.5 - Math.random() * 4.5,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.5,
          life: 0,
          max: 30 + Math.random() * 26,
          l: 3 + Math.random() * 5,
          c: CLIP_COLORS[(Math.random() * CLIP_COLORS.length) | 0],
        });
      }
      if (clips.length > 260) clips.splice(0, clips.length - 260);
    };

    const frame = () => {
      if (!visible || !W) return;
      const now = performance.now();
      const t = (now - t0) / 1000;
      const p = reduced ? 0 : Math.min(1, Math.max(0, mow.current?.p ?? 0));
      const mowerX = -70 + (W + 140) * p;
      const moving = p - lastP;
      if (moving > 0.0004 && p < 1) spray(mowerX, Math.min(10, Math.ceil(moving * W * 0.35)));
      lastP = p;

      if (ptr.on && now - ptr.idle > 1400) ptr.on = false;
      const R = mobile ? 70 : 120;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const buckets: number[][] = [[], [], [], [], [], []];
      const tilts = new Float32Array(blades.length);
      const heights = new Float32Array(blades.length);
      blades.forEach((b, i) => {
        const cut = b.x < mowerX - 18;
        const grow = reduced ? 1 : easeOut((t - b.delay) / 1.5);
        const target = cut ? b.cut : b.wild * grow;
        // the mower cuts at once; grass grows back slowly
        b.cur += (target - b.cur) * (reduced ? 1 : target < b.cur ? 0.45 : 0.06);
        const h = b.cur;

        if (!reduced) {
          if (ptr.on) {
            const dx = b.x - ptr.x;
            const ad = Math.abs(dx);
            if (ad < R && ptr.y > H - h - 50) {
              const f = (1 - ad / R) ** 2;
              b.vel += Math.sign(dx || 1) * f * 0.07 + ptr.vx * f * 0.0035;
            }
          }
          b.vel += -b.bend * 0.05;
          b.vel *= 0.86;
          b.bend = Math.max(-1.3, Math.min(1.3, b.bend + b.vel));
        }

        const isCut = cut && h < b.cut * 1.6;
        const sway = reduced
          ? 0
          : (Math.sin(t * 1.4 + b.x * 0.006 + b.ph) * 0.1 + Math.sin(t * 0.6 + b.x * 0.0021) * 0.08 + Math.max(0, Math.sin(t * 0.45 - b.x * 0.0035)) ** 6 * 0.28) *
            (isCut ? 0.15 : 1);
        tilts[i] = isCut ? (b.band ? 0.42 : -0.42) + sway + b.bend * 0.3 : b.lean + sway + b.bend;
        heights[i] = h;
        if (h > 0.5) buckets[isCut ? 4 + b.band : b.tone].push(i);
      });

      // the mowed lawn's turf: alternating stripes under the short blades
      const edge = Math.min(W, mowerX - 18);
      for (let x0 = 0, k = 0; x0 < edge; x0 += bandW, k++) {
        ctx.fillStyle = stripeGrad[k % 2];
        ctx.fillRect(x0, H - cutH * 0.45, Math.min(bandW, edge - x0), cutH * 0.45);
      }

      buckets.forEach((list, k) => {
        if (!list.length) return;
        ctx.fillStyle = k < 4 ? wildGrad[k] : stripeGrad[k - 4];
        ctx.beginPath();
        for (const i of list) blade(blades[i], heights[i], tilts[i]);
        ctx.fill();
      });

      if (p > 0 && p < 1) drawMower(mowerX, t);

      if (clips.length) {
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (let i = clips.length - 1; i >= 0; i--) {
          const c = clips[i];
          c.life++;
          c.vx *= 0.95;
          c.vy = c.vy * 0.95 + 0.26;
          c.x += c.vx;
          c.y += c.vy;
          c.r += c.vr;
          if (c.life > c.max || c.y > H) {
            clips.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = 1 - c.life / c.max;
          ctx.strokeStyle = c.c;
          ctx.beginPath();
          ctx.moveTo(c.x - Math.cos(c.r) * c.l * 0.5, c.y - Math.sin(c.r) * c.l * 0.5);
          ctx.lineTo(c.x + Math.cos(c.r) * c.l * 0.5, c.y + Math.sin(c.r) * c.l * 0.5);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    };

    build();
    frame();

    let lastW = W;
    let lastH = H;
    const ro = new ResizeObserver(() => {
      const r = cv.getBoundingClientRect();
      // ignore the phone URL bar nudging the height
      if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 80) return;
      lastW = r.width;
      lastH = r.height;
      build();
      frame();
    });
    ro.observe(cv);

    if (reduced) return () => ro.disconnect();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);

    const point = (cx: number, cy: number) => {
      const r = cv.getBoundingClientRect();
      const x = cx - r.left;
      ptr.vx = ptr.on ? x - ptr.x : 0;
      ptr.x = x;
      ptr.y = cy - r.top;
      ptr.on = true;
      ptr.idle = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") point(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const tt = e.touches[0];
      if (tt) point(tt.clientX, tt.clientY);
    };
    const onLeave = () => (ptr.on = false);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("touchstart", onTouch, { passive: true });
    host.addEventListener("touchmove", onTouch, { passive: true });
    host.addEventListener("touchend", onLeave);

    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("touchstart", onTouch);
      host.removeEventListener("touchmove", onTouch);
      host.removeEventListener("touchend", onLeave);
    };
  }, [mow]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
