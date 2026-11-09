# Fieldstone & Fern Landscapes (Scale by Noon demo)

- Niche: Landscaping & lawn care         (matches www.scalebynoon.com industry id: landscaping)
- Market / city: US – Southlake / Fort Worth, TX (also Keller, Colleyville, Grapevine, Flower Mound)
- Languages: en
- Live URL: https://fieldstone-fern-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/fieldstone-fern-demo (public, branch main)
- Folder: DBS Media Portfolio/Demo Websites/landscaping
- Stack: Next.js 16.3.6, React 19.2.8, Tailwind v4, GSAP 3.15 (ScrollTrigger, SplitText, Flip), Lenis, three.js 0.186 (desktop only, behind lib/three-gate)
- Palette: #16241C forest · #2F4A34 fern · #6E7F4E moss · #B9C2A4 sage · #F3EDE1 cream · #E2D5BC sand · #A3472C terracotta · #E8B45A lantern
  Fonts: Fraunces (display serif + italic accents), Hanken Grotesk (text/UI), DM Mono (labels)
- Pages: 30 routes, all statically generated.
  Home · Services + 7 service pages (lawn care, landscape design, hardscaping, outdoor lighting, irrigation, seasonal cleanups, tree & shrub care) ·
  Projects (filterable gallery) + 6 case studies · Lawn plans & pricing · Service areas + 6 city pages (Southlake, Keller, Colleyville, Grapevine, Fort Worth, Flower Mound) ·
  About · Reviews · FAQ · Free estimate (4-step form) · Contact · Privacy · 404. Plus /api/og, sitemap.xml, robots.txt, manifest.
- Signature features:
  - 3D hero lawn (three.js, desktop): ~100k instanced grass blades at golden hour with wind, back-lit tips and soft sun shadows; a crew member on a ride-on mower (built from primitives, no model file) drives in on arrival, and the hero scroll drives it down three lanes, serpentine, cutting real stripes and throwing clippings from the side chute (scroll back and the grass grows in again). The pointer parts the grass and leans the camera. Server HTML carries a still rendered from the scene (AVIF 109 KB); the canvas fades in over it after load.
  - 3D lawn-plan yard (three.js, desktop): the builder's yard is an architect's-model diorama (ranch house, drive, stepping stones, trees, hedges) with real sun shadows; size grows the lot, mowing lays stripes and sends the ride-on round its lanes, edging trims ragged borders into a steel edge, fertilizer drops granules, weed control pulls dandelions, hedge trimming shapes shaggy hedges into boxes. Pointer and scroll turn it. Phones and the fallback get the same model as 8 transparent still layers (~75 KB AVIF in all) cross-faded by the same toggles.
  - Planting bed: under the statement, ferns (with fiddlehead curls), grasses and coneflowers grow out of the stats line as you scroll, sway, and lean away from the cursor.
  - Two ways we work: the weekly card's lawn is mowed into stripes in a serpentine while the day marker slides to Thursday; the projects card draws itself as a patio blueprint, then opens from the fire pit into the finished build. Cards tilt to the cursor.
  - Services list: each service has a line glyph that acts out the job on hover (or when the row is centred on a phone), a mower-stripe sweep behind the live row, and row edges cut in by a trimmer head as you scroll.
  - Small touches further down: a stepping-stone path laid under the projects rail as it moves; a seedling beside the before/after that grows week by week with the slider; a plant that grows through the four process cards (seed → sprout → young plant → shrub in flower); leaves raked into a pile by the reviews link; a crew truck towing a mower that drives from the Southlake yard to the city you pick on the map; FAQ toggles that sprout a seedling when opened; a hedge along the closing band that gets trimmed into shape.
  - Seasons scroll: pinned scene through Spring → Winter; photo wipes open from the season dial, palette shifts, particles change (petals, heat motes, falling leaves, snow + frost vignette), each season lists its services.
  - Lawn-plan builder: yard size, services and weekly/bi-weekly drive the 3D yard above and an animated monthly price → pre-fills the estimate form.
  - Day-to-night lighting reveal: one real dusk photo; the yard starts dark and 14 fixtures switch on one by one as you scroll (or drag the slider), with a live clock and fixture counter.
  - Projects: horizontal pinned rail of arch-framed projects (morphs into the case-study hero via ViewTransition), filterable masonry gallery with GSAP Flip re-flow and a shared-element lightbox, before/after sliders (drag or keyboard).
  - Also: golden-hour video hero in an arch that opens to full-bleed, hover-preview service list, sticky stacking process cards, review marquees, stylized service-area map, custom cursor, leaf-shadow texture, arch page transitions, live "Open now" badge, text-before-arrival phone mock.
- Lighthouse (production build, local, mobile): home P 81 / A 100 / BP 100 / SEO 100 · inner pages P 85–90 / 100 / 100 / 100 · CLS 0.
  Desktop: P 97–99 / 100 / 100 / 100. (SEO measured with NEXT_PUBLIC_NOINDEX=false; the deployed demo is noindex on purpose, which Lighthouse reports as an SEO issue.)

- Phones (below 768 px or touch; desktop's order and motion stay as above): project-work order via CSS `order` (hero with a real project photo, gallery by type, reviews naming the project, before/after, how it works, budget guide, lawn builder, team, the rest, FAQ, quote form); no pins, scrubbing, video, GSAP or Lenis (lib/gsap loads them on demand, desktop only); two font files in public/fonts plus the system sans; the concept badge sits in the page flow at the very end. Motion kept: tap feedback, one fade-and-rise per section, swipe rows, the sliders and builder. The hero foot is a still rendered from the 3D lawn (22 KB AVIF). Zero bytes of three.js on phones (checked by scanning every script loaded through a full scroll).
- 3D gate (lib/three-gate.ts): after load + idle, `(min-width: 1024px) and (hover: hover) and (pointer: fine)`, no reduced motion, no Save-Data, WebGL2; only then `import()` of components/fx/lawn3d. Shaders compile async; no env map (its PMREM costs ~0.4 s); yard builds only when the builder is a screen away; both render only while on screen. Stills are re-rendered from the same scene modules (see components/fx/lawn3d) whenever the scenes change.

## Portfolio copy
EN title: Fieldstone & Fern Landscapes
EN one-liner (≤ 120 chars): A lush, image-led site for a Southlake landscaping & lawn-care company, with a live lawn-price builder and seasons scroll.
EN summary (2–3 sentences): A concept site for a Southlake, Texas landscape studio and weekly lawn crew. Visitors scroll through the four seasons, price their lawn in ten seconds with an animated yard builder, and watch a home's landscape lighting switch on at dusk. It is built on Next.js with 30 fast, SEO-ready pages, including city and service pages and a 4-step estimate form.
SR title: Fieldstone & Fern Landscapes
SR one-liner: Bujan sajt za firmu za uređenje dvorišta i održavanje travnjaka u Teksasu, sa kalkulatorom cene i scenom četiri godišnja doba.
SR summary: Koncept sajt za studio za pejzažnu arhitekturu i nedeljno održavanje travnjaka iz Southlakea u Teksasu. Posetilac skroluje kroz četiri godišnja doba, za deset sekundi izračuna cenu održavanja uz animirani prikaz dvorišta i gleda kako se u sumrak pali rasveta u dvorištu. Urađen u Next.js-u: 30 brzih, SEO-spremnih stranica, uključujući stranice za gradove i usluge i formular za procenu u 4 koraka.

## Screenshots
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/mobile-home.png, handoff/scroll.mp4
