// One-off: shrink downloaded source photos to web masters (next/image derives AVIF/WebP from these).
import sharp from "sharp";
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("public/images");
const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg"));
const meta = {};
for (const f of files) {
  const p = path.join(dir, f);
  const tmp = p + ".tmp";
  const img = sharp(p).rotate();
  const { width, height } = await img.metadata();
  const info = await img
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true, progressive: true })
    .toFile(tmp);
  await rename(tmp, p);
  meta[f.replace(".jpg", "")] = [info.width, info.height];
  console.log(f, width, "->", info.width, Math.round((await stat(p)).size / 1024) + "KB");
}
const { writeFile } = await import("node:fs/promises");
await writeFile("src/content/image-meta.json", JSON.stringify(meta, null, 0));
