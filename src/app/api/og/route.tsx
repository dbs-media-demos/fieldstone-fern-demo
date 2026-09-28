import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { MARK } from "@/components/brand/Logo";
import { imageMeta } from "@/content/images";

// Brand fonts, read once. URLs relative to this file are traced into the deployment bundle.
const [serif, serifItalic, sans, mono] = await Promise.all([
  readFile(new URL("../../../assets/fonts/Fraunces-400.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/Fraunces-Italic.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/Hanken-500.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/DMMono-400.ttf", import.meta.url)),
]);

/** Branded 1200×630 share image: /api/og?title=…&eyebrow=…&image=<photo slug> */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Fieldstone & Fern Landscapes").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") ?? "Southlake · Fort Worth, TX").slice(0, 50);
  const slug = searchParams.get("image") ?? "estate-lawn-hedges";
  const photo = imageMeta[slug] ? `${origin}/images/${slug}.jpg` : `${origin}/images/estate-lawn-hedges.jpg`;
  const size = title.length > 60 ? 54 : title.length > 36 ? 64 : 76;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#16241c", fontFamily: "Hanken" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 690, padding: "64px 56px 60px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="58" height="58" viewBox="0 0 48 48">
              {MARK.stones.map((d, i) => (
                <path key={i} d={d} fill="#e8b45a" opacity={1 - i * 0.12} />
              ))}
              <path d={MARK.frond} fill="none" stroke="#e8b45a" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 34, color: "#f3ede1", letterSpacing: -0.5 }}>
              Fieldstone<span style={{ fontFamily: "FrauncesItalic", color: "#e8b45a", margin: "0 8px" }}>&</span>Fern
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#e8b45a" }}>{eyebrow}</div>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: size, lineHeight: 1.02, letterSpacing: -2, color: "#f3ede1" }}>{title}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(243,237,225,0.7)", fontSize: 22 }}>
            <div style={{ display: "flex", fontFamily: "FrauncesItalic", fontSize: 28, color: "#f3ede1" }}>Grown for Texas. Kept like home.</div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, padding: "40px 40px 0 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" width={470} height={590} style={{ objectFit: "cover", borderRadius: "235px 235px 0 0", width: 470, height: 590 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: serif, weight: 400, style: "normal" },
        { name: "FrauncesItalic", data: serifItalic, weight: 400, style: "italic" },
        { name: "Hanken", data: sans, weight: 500, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
