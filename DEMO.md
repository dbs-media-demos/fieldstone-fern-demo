# Fieldstone & Fern Landscapes (Scale by Noon demo)

- Niche: Landscaping & lawn care         (matches scale-by-noon.vercel.app industry id: landscaping)
- Market / city: US – Southlake / Fort Worth, TX (also Keller, Colleyville, Grapevine, Flower Mound)
- Languages: en
- Live URL: https://fieldstone-fern-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/fieldstone-fern-demo (public, branch main)
- Folder: DBS Media Portfolio/Demo Websites/landscaping
- Stack: Next.js 16.3.6, React 19.2.8, Tailwind v4, GSAP 3.15 (ScrollTrigger, SplitText, Flip), Lenis
- Palette: #16241C forest · #2F4A34 fern · #6E7F4E moss · #B9C2A4 sage · #F3EDE1 cream · #E2D5BC sand · #A3472C terracotta · #E8B45A lantern
  Fonts: Fraunces (display serif + italic accents), Hanken Grotesk (text/UI), DM Mono (labels)
- Pages: 30 routes, all statically generated.
  Home · Services + 7 service pages (lawn care, landscape design, hardscaping, outdoor lighting, irrigation, seasonal cleanups, tree & shrub care) ·
  Projects (filterable gallery) + 6 case studies · Lawn plans & pricing · Service areas + 6 city pages (Southlake, Keller, Colleyville, Grapevine, Fort Worth, Flower Mound) ·
  About · Reviews · FAQ · Free estimate (4-step form) · Contact · Privacy · 404. Plus /api/og, sitemap.xml, robots.txt, manifest.
- Signature features:
  - Seasons scroll: pinned scene through Spring → Winter; photo wipes open from the season dial, palette shifts, particles change (petals, heat motes, falling leaves, snow + frost vignette), each season lists its services.
  - Lawn-plan builder: yard-size slider grows a top-down yard illustration; services toggle mowing stripes (with a mower), edging, fertilizer granules, weeds and hedges; weekly/bi-weekly; animated monthly price → pre-fills the estimate form.
  - Day-to-night lighting reveal: one real dusk photo; the yard starts dark and 14 fixtures switch on one by one as you scroll (or drag the slider), with a live clock and fixture counter.
  - Projects: horizontal pinned rail of arch-framed projects (morphs into the case-study hero via ViewTransition), filterable masonry gallery with GSAP Flip re-flow and a shared-element lightbox, before/after sliders (drag or keyboard).
  - Also: golden-hour video hero in an arch that opens to full-bleed, hover-preview service list, sticky stacking process cards, review marquees, stylized service-area map, custom cursor, leaf-shadow texture, arch page transitions, live "Open now" badge, text-before-arrival phone mock.
- Lighthouse (production build, local, mobile): home P 81 / A 100 / BP 100 / SEO 100 · inner pages P 85–90 / 100 / 100 / 100 · CLS 0.
  Desktop: P 97–99 / 100 / 100 / 100. (SEO measured with NEXT_PUBLIC_NOINDEX=false; the deployed demo is noindex on purpose, which Lighthouse reports as an SEO issue.)

## Portfolio copy
EN title: Fieldstone & Fern Landscapes
EN one-liner (≤ 120 chars): A lush, image-led site for a Southlake landscaping & lawn-care company, with a live lawn-price builder and seasons scroll.
EN summary (2–3 sentences): A concept site for a Southlake, Texas landscape studio and weekly lawn crew. Visitors scroll through the four seasons, price their lawn in ten seconds with an animated yard builder, and watch a home's landscape lighting switch on at dusk. It is built on Next.js with 30 fast, SEO-ready pages, including city and service pages and a 4-step estimate form.
SR title: Fieldstone & Fern Landscapes
SR one-liner: Bujan sajt za firmu za uređenje dvorišta i održavanje travnjaka u Teksasu, sa kalkulatorom cene i scenom četiri godišnja doba.
SR summary: Koncept sajt za studio za pejzažnu arhitekturu i nedeljno održavanje travnjaka iz Southlakea u Teksasu. Posetilac skroluje kroz četiri godišnja doba, za deset sekundi izračuna cenu održavanja uz animirani prikaz dvorišta i gleda kako se u sumrak pali rasveta u dvorištu. Urađen u Next.js-u: 30 brzih, SEO-spremnih stranica, uključujući stranice za gradove i usluge i formular za procenu u 4 koraka.

## Screenshots
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/mobile-home.png, handoff/scroll.mp4
