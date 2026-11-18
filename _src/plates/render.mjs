/**
 * Renders the plates for the /v2 hero (the homepage without 3D) from the live three.js hero lawn
 * (src/components/fx/lawn3d/HeroLawnScene.ts), so the 2D lawn on /v2 is the same lawn as on /:
 *
 *   public/images/3d/v2/plate.*      the lawn before the mower (lanes 0-2 long), no mower
 *   public/images/3d/v2/cut-{k}.*    the strip that changes when lane k is cut (cropped to what changes)
 *   public/images/3d/v2/mower-{k}.*  the mower in lane k (frames side by side, wheels turning), grass in front cut out
 *   src/components/fx/lawn2d/plates.json   camera matrix, lanes, crops and sprite anchors
 *
 * Camera and sun are held still for every plate (patched in the bundle only; the site's scene is
 * untouched), so the plates line up pixel for pixel. Re-run after changing the hero lawn scene.
 *
 *   npm i --no-save esbuild               # tool only, not a site dependency (Playwright from any install)
 *   node _src/plates/render.mjs
 *
 * Uses the installed Google Chrome (real GPU) via Playwright's "chrome" channel.
 */
import { build } from "esbuild";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(here, "../..");
const OUT = path.join(root, "public/images/3d/v2");
const META = path.join(root, "src/components/fx/lawn2d/plates.json");
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP || "/tmp"), "lawn2d-"));

/** Patch the scene in the bundle: fixed camera and sun, a wider shadow, and its parts exposed. */
const patch = {
  name: "hold-still",
  setup(b) {
    b.onLoad({ filter: /HeroLawnScene\.ts$/ }, (args) => {
      let src = fs.readFileSync(args.path, "utf8").replace(/\r\n/g, "\n");
      const swap = (a, z) => {
        if (!src.includes(a)) throw new Error(`patch target missing: ${a}`);
        src = src.replace(a, z);
      };
      swap("const sp = Math.min(1, s / LANES);", "const sp = 0;");
      swap("sun.target.position.set(p.x, 0, p.z);", "sun.target.position.set(0, 0, -0.4);");
      swap("sun.shadow.mapSize.set(2048, 2048);", "sun.shadow.mapSize.set(4096, 4096);");
      swap("sc.left = -3.4;", "sc.left = -9;");
      swap("sc.right = 3.4;", "sc.right = 9;");
      swap("sc.top = 3.4;", "sc.top = 7;");
      swap("sc.bottom = -3.4;", "sc.bottom = -7;");
      swap(
        "  return {\n    setProgress(p) {",
        "  const __api = {\n    _x: { THREE, scene, camera, renderer, mower, clips, grassMat, ground, render, laneZ, laneX0, laneX1, lawn: null },\n    setProgress(p) {",
      );
      src = src.replace(/\n  };\n}\s*$/, "\n  };\n  __api._x.lawn = __api;\n  return __api;\n}\n");
      return { contents: src, loader: "ts" };
    });
  },
};

await build({ entryPoints: [path.join(here, "entry.mjs")], bundle: true, format: "iife", outfile: path.join(tmp, "scene.js"), logLevel: "warning", plugins: [patch] });
fs.writeFileSync(path.join(tmp, "index.html"), '<!doctype html><body style="margin:0;background:#000"><canvas></canvas><script src="scene.js"></script></body>');

const png = (dataUrl) => Buffer.from(dataUrl.split(",")[1], "base64");
const raw = async (buf) => (await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
try {
  const page = await browser.newPage({ viewport: { width: 1900, height: 700 }, deviceScaleFactor: 1 });
  page.on("console", (m) => m.type() === "error" && console.error(m.text()));
  await page.goto(url.pathToFileURL(path.join(tmp, "index.html")).href);
  await page.waitForFunction(() => window.__ready && window.__lawn, null, { timeout: 90000 });
  const meta = await page.evaluate(() => window.__lawn.meta());
  const { w: W, h: H } = meta;

  fs.mkdirSync(OUT, { recursive: true });
  const save = async (img, name, { avif = 46, webp = 74 } = {}) => {
    await img.clone().avif({ quality: avif, effort: 6 }).toFile(path.join(OUT, name + ".avif"));
    await img.clone().webp({ quality: webp, effort: 6, alphaQuality: 85 }).toFile(path.join(OUT, name + ".webp"));
    const kb = (f) => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1);
    console.log(name, kb(name + ".avif"), "KB avif /", kb(name + ".webp"), "KB webp");
  };

  // plates: before the mower, then after each lane
  const shots = [];
  for (const s of [-0.14, 1, 2, 3]) shots.push(png(await page.evaluate((s) => window.__lawn.plate(s), s)));
  if (process.env.DEBUG_PLATES) shots.forEach((b, i) => fs.writeFileSync(path.join(tmp, `p${i}.png`), b) && console.log(path.join(tmp, `p${i}.png`)));
  await save(sharp(shots[0]), "plate");

  // each lane's strip: the rows and columns that change when that lane is cut (a little margin)
  const cuts = [];
  for (let k = 0; k < 3; k++) {
    const a = await raw(shots[k]);
    const b = await raw(shots[k + 1]);
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]);
        if (d > 24) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    const m = 6;
    const box = { left: Math.max(0, x0 - m), top: Math.max(0, y0 - m) };
    box.width = Math.min(W, x1 + m + 1) - box.left;
    box.height = Math.min(H, y1 + m + 1) - box.top;
    await save(sharp(shots[k + 1]).extract(box), `cut-${k}`);
    cuts.push({ x: box.left, y: box.top, w: box.width, h: box.height });
  }

  // the mower in each lane: 4 frames, a quarter of a lug apart (the rear tyre has 22 lugs)
  const FRAMES = 4;
  const lug = (2 * Math.PI * 0.29) / 22;
  const mowers = [];
  for (let k = 0; k < 3; k++) {
    const r = await page.evaluate(([k, n, st]) => window.__lawn.mower(k, n, st), [k, FRAMES, lug / FRAMES]);
    const bufs = r.frames.map(png);
    // one box around every frame's pixels
    const boxes = await Promise.all(bufs.map((b) => sharp(b).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })));
    const l = Math.min(...boxes.map((o) => -o.info.trimOffsetLeft));
    const t = Math.min(...boxes.map((o) => -o.info.trimOffsetTop));
    const rr = Math.max(...boxes.map((o) => -o.info.trimOffsetLeft + o.info.width));
    const bb = Math.max(...boxes.map((o) => -o.info.trimOffsetTop + o.info.height));
    const fw = rr - l + 4;
    const fh = bb - t + 4;
    const sheet = sharp({ create: { width: fw * FRAMES, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(
      await Promise.all(
        bufs.map(async (b, i) => ({
          input: await sharp(b).extract({ left: Math.max(0, l - 2), top: Math.max(0, t - 2), width: Math.min(fw, W - Math.max(0, l - 2)), height: Math.min(fh, H - Math.max(0, t - 2)) }).toBuffer(),
          left: i * fw,
          top: 0,
        })),
      ),
    );
    await save(sharp(await sheet.png().toBuffer()), `mower-${k}`, { avif: 58, webp: 82 });
    mowers.push({ fw, fh, frames: FRAMES, ox: Math.max(0, l - 2) - r.anchor[0], oy: Math.max(0, t - 2) - r.anchor[1], at: r.at, chute: r.chute });
  }

  const json = { ...meta, clip: meta.clip.map((v) => +v.toFixed(6)), cuts, mowers };
  fs.mkdirSync(path.dirname(META), { recursive: true });
  fs.writeFileSync(META, JSON.stringify(json, null, 1) + "\n");
  console.log("meta →", path.relative(root, META));
} finally {
  await browser.close();
  if (!process.env.DEBUG_PLATES) fs.rmSync(tmp, { recursive: true, force: true });
}
