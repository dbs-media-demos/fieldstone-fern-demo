import meta from "./plates.json";

/**
 * The /v2 hero lawn: the same golden-hour lawn and ride-on mower as the 3D hero on /, drawn with
 * canvas 2D only (no three.js, no WebGL). Plates rendered from the 3D scene (see _src/plates) are
 * composited lane by lane: the mower drives in from the left over last week's stripes, meets the long
 * grass and starts cutting; the hero scroll drives it on down three lanes, serpentine, and each lane
 * turns into a stripe behind it, with clippings thrown from the side chute (simulated in the scene's
 * own world space and projected with its camera). A gust of wind rolls light across the long grass and
 * a fringe of near blades sways and parts around the pointer. Scroll back and the grass grows in again.
 *
 * Draws only while on screen and the tab is visible. A slow first two seconds drop the extras.
 * Reduced motion: one still frame, mower in the lane, nothing moves.
 */
export type Lawn2D = {
  setPointer: (x: number, y: number) => void;
  clearPointer: () => void;
  setVisible: (v: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

type Opts = {
  /** Hero scroll progress, 0 → 1 */
  progress: () => number;
  reduced: boolean;
  /** The still under the canvas (the same plate): reused when it has already loaded */
  still?: HTMLImageElement | null;
  /** First frame drawn: fade the canvas in */
  onReady: () => void;
};

const SRC = "/images/3d/v2/";
const LANES = 3;
const PW = meta.w;
const PH = meta.h;
const M = meta.clip;
const START = -0.5; // off screen to the left, on last week's stripes
const PRECUT = -0.14; // lane 0 is cut up to here on the plate
const LUG = (2 * Math.PI * 0.29) / 22; // one lug of the rear tyre, metres
const CLIP_COLORS = ["#86a24a", "#a9bf66", "#5f7d38", "#c3b25e", "#739041"];
const FRINGE = [
  ["#43632f", "#1c3020", "#0d160f"],
  ["#7d9443", "#2f4a28", "#0f1a12"],
  ["#a99f52", "#3d5530", "#101b13"],
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** World (metres) → plate pixels, with the 3D hero's camera. */
function project(x: number, y: number, z: number): [number, number] {
  const cx = M[0] * x + M[4] * y + M[8] * z + M[12];
  const cy = M[1] * x + M[5] * y + M[9] * z + M[13];
  const cw = M[3] * x + M[7] * y + M[11] * z + M[15];
  return [((cx / cw + 1) / 2) * PW, ((1 - cy / cw) / 2) * PH];
}
// where the lanes (lines of constant x) meet: the cut front is a line through here
const VP: [number, number] = [((M[8] / M[11] + 1) / 2) * PW, ((1 - M[9] / M[11]) / 2) * PH];

function load(name: string): Promise<HTMLImageElement> {
  const one = (ext: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => void img.decode().then(() => res(img), () => res(img));
      img.onerror = rej;
      img.src = SRC + name + ext;
    });
  return one(".avif").catch(() => one(".webp"));
}

const pathAt = (s: number) => {
  const k = clamp(Math.floor(s), 0, LANES - 1);
  const f = s - k;
  const l = meta.lanes[k];
  const dir = k % 2 === 0 ? 1 : -1;
  return { k, dir, z: l.z, x: dir > 0 ? l.x0 + (l.x1 - l.x0) * f : l.x1 - (l.x1 - l.x0) * f };
};

export async function createLawn2D(canvas: HTMLCanvasElement, opts: Opts): Promise<Lawn2D> {
  const stillReady = opts.still && opts.still.complete && opts.still.naturalWidth === PW ? opts.still : null;
  const [plate, cuts, mowers] = await Promise.all([
    stillReady ? Promise.resolve(stillReady) : load("plate"),
    Promise.all([0, 1, 2].map((k) => load(`cut-${k}`))),
    Promise.all([0, 1, 2].map((k) => load(`mower-${k}`))),
  ]);

  const ctx = canvas.getContext("2d", { alpha: true })!;
  // the lawn with every finished lane laid in, rebuilt only when the cut moves
  const base = document.createElement("canvas");
  base.width = PW;
  base.height = PH;
  const bctx = base.getContext("2d")!;
  // the lane being cut: its strip, faded out past the cut front
  const strip = document.createElement("canvas");
  const sctx = strip.getContext("2d")!;
  strip.width = Math.max(...meta.cuts.map((c) => c.w));
  strip.height = Math.max(...meta.cuts.map((c) => c.h));

  let W = 1;
  let H = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let lite = false;
  // plate → CSS pixels (cover, anchored to the bottom like the still's object-cover object-bottom)
  let cs = 1;
  let ox = 0;
  let oy = 0;

  type Blade = { x: number; h: number; w: number; lean: number; ph: number; tone: number; bend: number; vel: number };
  let blades: Blade[] = [];
  let fringeGrad: CanvasGradient[] = [];

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cs = Math.max(W / PW, H / PH);
    ox = (W - PW * cs) / 2;
    oy = H - PH * cs;
    // the near fringe: blades a little closer than anything on the plate
    const n = Math.round(W / 6.5);
    blades = Array.from({ length: n }, (_, i) => {
      const back = Math.random() < 0.45;
      return {
        x: ((i + Math.random()) / n) * (W + 40) - 20,
        h: H * (back ? 0.07 + Math.random() * 0.09 : 0.05 + Math.pow(Math.random(), 1.6) * 0.17),
        w: 5 + Math.random() * 7,
        lean: (Math.random() - 0.5) * 0.6,
        ph: Math.random() * Math.PI * 2,
        tone: back ? 0 : 1 + Math.floor(Math.random() * 2),
        bend: 0,
        vel: 0,
      };
    });
    blades.sort((a, b) => a.tone - b.tone);
    fringeGrad = FRINGE.map((c) => {
      const g = ctx.createLinearGradient(0, H * 0.72, 0, H);
      g.addColorStop(0, c[0]);
      g.addColorStop(0.5, c[1]);
      g.addColorStop(1, c[2]);
      return g;
    });
  };

  // ── state ──
  let s = START;
  let cutS = START;
  let baseCut = -99; // forces the first build
  let dist = 0;
  let lastX = pathAt(s).x;
  let lastK = 0;
  let t0 = 0;
  let last = 0;
  let raf = 0;
  let visible = true;
  let disposed = false;
  const ptr = { x: -9999, y: -9999, vx: 0, on: false };

  // clippings, in world metres (the 3D scene's own physics)
  const MAXC = 420;
  const cP = new Float32Array(MAXC * 3);
  const cV = new Float32Array(MAXC * 3);
  const cR = new Float32Array(MAXC * 2);
  const cL = new Float32Array(MAXC);
  let head = 0;

  /** Lay the finished lanes, and the lane being cut up to its front, into the base. */
  const buildBase = () => {
    baseCut = cutS;
    bctx.clearRect(0, 0, PW, PH);
    bctx.drawImage(plate, 0, 0);
    for (let k = 0; k < LANES; k++) {
      const f = cutS - k;
      const c = meta.cuts[k];
      if (f >= 1) {
        bctx.drawImage(cuts[k], c.x, c.y);
        continue;
      }
      if (f <= (k === 0 ? PRECUT : 0)) break;
      const l = meta.lanes[k];
      const dir = k % 2 === 0 ? 1 : -1;
      const xf = dir > 0 ? l.x0 + (l.x1 - l.x0) * f : l.x1 - (l.x1 - l.x0) * f;
      // the front: a line through the vanishing point, feathered across it
      const b = project(xf, 0, l.z);
      let dx = b[0] - VP[0];
      let dy = b[1] - VP[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      // normal pointing to the cut side (behind the mower)
      let nx = dy;
      let ny = -dx;
      if (nx * dir > 0) {
        nx = -nx;
        ny = -ny;
      }
      const F = 9;
      const px = b[0] - c.x;
      const py = b[1] - c.y;
      sctx.globalCompositeOperation = "source-over";
      sctx.clearRect(0, 0, strip.width, strip.height);
      sctx.drawImage(cuts[k], 0, 0);
      sctx.globalCompositeOperation = "destination-in";
      const g = sctx.createLinearGradient(px + nx * F, py + ny * F, px - nx * F, py - ny * F);
      g.addColorStop(0, "#000");
      g.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, c.w, c.h);
      bctx.drawImage(strip, 0, 0, c.w, c.h, c.x, c.y, c.w, c.h);
      break;
    }
  };

  const spray = (k: number, x: number, dir: number, amount: number) => {
    const m = meta.mowers[k];
    const cx = x + (m.chute[0] - m.at[0]);
    const cy = m.chute[1];
    const cz = m.chute[2];
    const n = Math.min(lite ? 8 : 18, Math.round(amount));
    for (let j = 0; j < n; j++) {
      const i = head;
      head = (head + 1) % MAXC;
      cP[i * 3] = cx + (Math.random() - 0.5) * 0.18;
      cP[i * 3 + 1] = cy + Math.random() * 0.05;
      cP[i * 3 + 2] = cz;
      cV[i * 3] = -dir * (0.3 + Math.random() * 0.9) + (Math.random() - 0.5) * 0.6;
      cV[i * 3 + 1] = 1.8 + Math.random() * 2.4;
      cV[i * 3 + 2] = dir * (1.6 + Math.random() * 2.6);
      cR[i * 2] = Math.random() * 6.28;
      cR[i * 2 + 1] = (Math.random() - 0.5) * 18;
      cL[i] = 0.0001;
    }
  };

  const drawClips = (dt: number) => {
    ctx.lineCap = "round";
    for (let i = 0; i < MAXC; i++) {
      if (cL[i] <= 0) continue;
      cL[i] += dt;
      if (cP[i * 3 + 1] > 0.03) {
        cV[i * 3 + 1] -= 9.8 * dt;
        const drag = Math.pow(0.18, dt);
        cV[i * 3] *= drag;
        cV[i * 3 + 2] *= drag;
        cP[i * 3] += cV[i * 3] * dt;
        cP[i * 3 + 1] += cV[i * 3 + 1] * dt;
        cP[i * 3 + 2] += cV[i * 3 + 2] * dt;
        cR[i * 2] += cR[i * 2 + 1] * dt;
      } else cP[i * 3 + 1] = 0.03;
      const fade = 1 - clamp((cL[i] - 1.4) / 1, 0, 1);
      if (fade <= 0) {
        cL[i] = 0;
        continue;
      }
      const x = cP[i * 3];
      const y = cP[i * 3 + 1];
      const z = cP[i * 3 + 2];
      const a = cR[i * 2];
      const hl = 0.035;
      const p0 = project(x - Math.cos(a) * hl, y - Math.sin(a) * hl * 0.6, z);
      const p1 = project(x + Math.cos(a) * hl, y + Math.sin(a) * hl * 0.6, z + Math.sin(a) * hl * 0.5);
      ctx.globalAlpha = fade * 0.9;
      ctx.strokeStyle = CLIP_COLORS[i % CLIP_COLORS.length];
      ctx.lineWidth = Math.max(1, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * 0.22);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const drawMower = (k: number, x: number, z: number, t: number) => {
    const m = meta.mowers[k];
    const [ax, ay] = project(x, 0, z);
    // soft shadow, thrown toward us and to the left by the low sun behind the lawn
    const [sx, sy] = project(x - 0.3, 0, z + 0.5);
    const [ex] = project(x + 0.85, 0, z + 0.5);
    const rx = Math.abs(ex - sx) * 1.05;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, "rgba(10,20,12,0.5)");
    g.addColorStop(0.6, "rgba(10,20,12,0.22)");
    g.addColorStop(1, "rgba(10,20,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
    const fr = Math.floor(dist / (LUG / m.frames)) % m.frames;
    const shake = opts.reduced ? 0 : Math.sin(t * 47) * 0.35 + Math.sin(t * 31) * 0.25;
    ctx.drawImage(mowers[k], ((fr + m.frames) % m.frames) * m.fw, 0, m.fw, m.fh, ax + m.ox, ay + m.oy + shake, m.fw, m.fh);
  };

  /** Wind: a warm swell of light rolling across the long grass. */
  const drawGust = (t: number) => {
    const span = PW * 1.9;
    const gx = ((t * 95) % span) - PW * 0.45;
    const top = PH * 0.42;
    const g = ctx.createLinearGradient(gx - 300, 0, gx + 300, 0);
    g.addColorStop(0, "rgba(255,214,140,0)");
    g.addColorStop(0.5, "rgba(255,214,140,0.13)");
    g.addColorStop(1, "rgba(255,214,140,0)");
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = g;
    ctx.fillRect(gx - 300, top, 600, PH - top);
    ctx.globalCompositeOperation = "source-over";
  };

  const drawFringe = (t: number, still: boolean) => {
    const R = 110;
    const buckets: number[][] = [[], [], []];
    const tilts = new Float32Array(blades.length);
    blades.forEach((b, i) => {
      if (!still) {
        if (ptr.on) {
          const dx = b.x - ptr.x;
          const ad = Math.abs(dx);
          if (ad < R && ptr.y > H - b.h - 60) {
            const f = (1 - ad / R) ** 2;
            b.vel += Math.sign(dx || 1) * f * 0.06 + ptr.vx * f * 0.003;
          }
        }
        b.vel += -b.bend * 0.05;
        b.vel *= 0.86;
        b.bend = clamp(b.bend + b.vel, -1.2, 1.2);
      }
      const sway = still
        ? 0
        : Math.sin(t * 1.3 + b.x * 0.006 + b.ph) * 0.09 + Math.sin(t * 0.55 + b.x * 0.002) * 0.07 + Math.max(0, Math.sin(t * 0.42 - b.x * 0.0032)) ** 6 * 0.3;
      tilts[i] = b.lean + sway + b.bend;
      buckets[b.tone].push(i);
    });
    buckets.forEach((list, k) => {
      ctx.fillStyle = fringeGrad[k];
      ctx.beginPath();
      for (const i of list) {
        const b = blades[i];
        const tilt = tilts[i];
        const tipX = b.x + tilt * b.h * 0.75;
        const tipY = H - b.h * (1 - Math.min(0.45, Math.abs(tilt) * 0.3));
        const cx = b.x + tilt * b.h * 0.18;
        const cy = H - b.h * 0.55;
        ctx.moveTo(b.x - b.w / 2, H + 1);
        ctx.quadraticCurveTo(cx - b.w * 0.18, cy, tipX, tipY);
        ctx.quadraticCurveTo(cx + b.w * 0.18, cy, b.x + b.w / 2, H + 1);
      }
      ctx.fill();
    });
  };

  // first seconds watched: a slow machine keeps the lawn and mower, drops the extras
  let watchN = 0;
  let watchT = 0;
  let watchMs = 0;

  const draw = (t: number, dt: number) => {
    const p = clamp(opts.progress(), 0, 1);
    // arrival: drive in from the left over last week's stripes, into the long grass, then keep at it slowly
    const auto = opts.reduced ? 0.16 : START + (0.66 * easeInOut(t / 4.2)) + Math.max(0, t - 4.2) * 0.008;
    const goal = Math.max(Math.min(auto, 0.8), p * LANES + (p > 0.995 ? 0.6 : 0));
    s = opts.reduced ? goal : s + (goal - s) * Math.min(1, dt * 5);
    if (s > cutS) cutS = s;
    else cutS += (s - cutS) * Math.min(1, dt * 1.6);
    if (Math.abs(cutS - baseCut) > 0.0005) buildBase();

    const at = pathAt(Math.min(s, LANES + 0.4));
    let moved = (at.x - lastX) * at.dir;
    if (at.k !== lastK) moved = 0; // the turn happens off screen
    lastX = at.x;
    lastK = at.k;
    dist += moved;
    const inLong = s - at.k > (at.k === 0 ? PRECUT : 0) && s < LANES;
    if (!opts.reduced && moved > 0.002 && inLong) spray(at.k, at.x, at.dir, moved * 60);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // the scroll pushes in a little, as the camera does on /
    const push = 1 + p * 0.06;
    const tx = (W / 2) * (1 - push) + ox * push;
    const ty = H * 0.45 * (1 - push) + oy * push;
    ctx.setTransform(dpr * cs * push, 0, 0, dpr * cs * push, dpr * tx, dpr * ty);
    ctx.drawImage(base, 0, 0);
    if (!lite && !opts.reduced) drawGust(t);
    // the chute throws toward us in lanes 0 and 2, away from us in lane 1 (behind the mower)
    if (at.dir < 0) drawClips(dt);
    if (s < LANES + 0.4) drawMower(at.k, at.x, at.z, t);
    if (at.dir > 0) drawClips(dt);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!lite) drawFringe(t, opts.reduced);
  };

  const tick = (now: number) => {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const t = (now - t0) / 1000;
    const a = performance.now();
    draw(t, dt);
    if (!lite && watchT < 2000) {
      watchT += dt * 1000;
      watchN++;
      watchMs += performance.now() - a;
      // over ~8 ms of drawing per frame on average, or real frames under ~45 fps: lighten
      if (watchT >= 2000 && (watchMs / watchN > 8 || watchN / (watchT / 1000) < 45)) {
        lite = true;
        dpr = 1;
        resize();
      }
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf && visible && !disposed && !opts.reduced) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  };
  const onVis = () => !document.hidden && start();
  document.addEventListener("visibilitychange", onVis);

  resize();
  t0 = performance.now();
  draw(0, 0);
  opts.onReady();
  start();

  return {
    setPointer(x, y) {
      ptr.vx = ptr.on ? x - ptr.x : 0;
      ptr.x = x;
      ptr.y = y;
      ptr.on = true;
    },
    clearPointer() {
      ptr.on = false;
    },
    setVisible(v) {
      visible = v;
      if (v) start();
    },
    resize() {
      resize();
      if (opts.reduced) draw(0, 0);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      base.width = base.height = strip.width = strip.height = 0;
    },
  };
}
