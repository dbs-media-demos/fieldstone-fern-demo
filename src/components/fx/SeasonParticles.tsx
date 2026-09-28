"use client";

import { useEffect, useRef } from "react";
import { isTouch, prefersReducedMotion } from "@/lib/gsap";

export type ParticleMode = "spring" | "summer" | "fall" | "winter";

type P = {
  kind: ParticleMode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  phase: number;
  color: string;
  life: number;
};

const PALETTE: Record<ParticleMode, string[]> = {
  spring: ["#f6c9d5", "#f2b3c4", "#fbe3ea", "#eea0b6"],
  summer: ["#ffe29a", "#f7c95c", "#fff1c9"],
  fall: ["#d9642b", "#b8431f", "#e89a3c", "#8f3a1c", "#c77a2a"],
  winter: ["#ffffff", "#e8f3fa", "#d6e8f2"],
};

/**
 * Lightweight 2D canvas particle layer for the seasons scene:
 * petals, heat motes, tumbling leaves and snow. Starts on idle, runs at 30fps
 * on touch devices, pauses off-screen, and never runs with reduced motion.
 */
export function SeasonParticles({ mode, className }: { mode: ParticleMode; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || prefersReducedMotion()) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const coarse = isTouch();
    const max = coarse ? 34 : 70;
    const frameGap = coarse ? 1000 / 30 : 0;
    let w = 0,
      h = 0,
      dpr = 1;
    const parts: P[] = [];
    let raf = 0,
      last = 0,
      visible = false,
      started = false;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (kind: ParticleMode, anywhere = false): P => {
      const pal = PALETTE[kind];
      const color = pal[(Math.random() * pal.length) | 0];
      const base = { kind, rot: Math.random() * Math.PI * 2, phase: Math.random() * Math.PI * 2, color, life: 0 };
      switch (kind) {
        case "spring":
          return { ...base, x: Math.random() * w * 1.2 - w * 0.1, y: anywhere ? Math.random() * h : -20, vx: 0.35 + Math.random() * 0.5, vy: 0.45 + Math.random() * 0.6, r: 4 + Math.random() * 5, vr: (Math.random() - 0.5) * 0.04 };
        case "summer":
          return { ...base, x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10, vx: (Math.random() - 0.5) * 0.2, vy: -(0.25 + Math.random() * 0.45), r: 1 + Math.random() * 2.4, vr: 0 };
        case "fall":
          return { ...base, x: Math.random() * w * 1.2 - w * 0.2, y: anywhere ? Math.random() * h : -30, vx: 0.5 + Math.random() * 0.9, vy: 0.8 + Math.random() * 0.9, r: 7 + Math.random() * 7, vr: (Math.random() - 0.5) * 0.06 };
        default:
          return { ...base, x: Math.random() * w, y: anywhere ? Math.random() * h : -10, vx: (Math.random() - 0.5) * 0.3, vy: 0.35 + Math.random() * 0.7, r: 1 + Math.random() * 2.2, vr: 0 };
      }
    };

    const drawLeaf = (p: P, flip: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(flip, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.5, p.r * 0.7, p.r * 0.6, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.6, -p.r * 0.9, -p.r * 0.5, 0, -p.r);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,20,8,0.35)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -p.r * 0.9);
      ctx.lineTo(0, p.r * 1.25);
      ctx.stroke();
      ctx.restore();
    };

    const drawPetal = (p: P, flip: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(flip, 1);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      if (frameGap && t - last < frameGap) return;
      const dt = last ? Math.min((t - last) / 16.7, 3) : 1;
      last = t;

      const current = modeRef.current;
      const want = current === "summer" ? Math.round(max * 0.8) : current === "fall" ? Math.round(max * 0.6) : max;
      const alive = parts.filter((p) => p.kind === current).length;
      if (alive < want && Math.random() < 0.5) parts.push(spawn(current));

      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        p.phase += 0.02 * dt;
        // Particles from a previous season fade out quickly.
        const fading = p.kind !== current;
        if (fading) p.life += 4 * dt;

        if (p.kind === "spring") {
          p.x += (p.vx + Math.sin(p.phase) * 0.6) * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          drawPetal(p, Math.cos(p.phase * 1.4));
        } else if (p.kind === "summer") {
          p.x += (p.vx + Math.sin(p.phase * 0.7) * 0.25) * dt;
          p.y += p.vy * dt;
          const a = 0.35 + 0.35 * Math.sin(p.phase * 3);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, p.color);
          g.addColorStop(1, "rgba(255,220,140,0)");
          ctx.globalAlpha = a * (fading ? 0.4 : 1);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (p.kind === "fall") {
          p.x += (p.vx + Math.sin(p.phase) * 1.2) * dt;
          p.y += (p.vy + Math.cos(p.phase * 0.8) * 0.3) * dt;
          p.rot += p.vr * dt;
          drawLeaf(p, Math.cos(p.phase * 2));
        } else {
          p.x += (p.vx + Math.sin(p.phase) * 0.35) * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        const out = p.y > h + 40 || p.y < -60 || p.x > w + 60 || p.x < -80;
        if (out || (fading && p.life > 140)) parts.splice(i, 1);
      }
    };

    const start = () => {
      if (started) return;
      started = true;
      resize();
      for (let i = 0; i < max * 0.6; i++) parts.push(spawn(modeRef.current, true));
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) last = 0;
    });
    io.observe(cv);
    window.addEventListener("resize", resize);

    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const idle = ric(start);

    return () => {
      cic(idle as number);
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
