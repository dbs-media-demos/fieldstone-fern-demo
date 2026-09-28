# Fieldstone & Fern Landscapes: DBS Media concept site

A demo website for a fictional landscaping and lawn-care company in Southlake / Fort Worth, Texas, built by [DBS Media](https://dbs-media.com).
See `DEMO.md` for the portfolio handoff.

## Stack
Next.js 16 (App Router, Turbopack), React 19.2, Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, Flip) + Lenis.

## Develop
```bash
npm install
npm run dev -- --port 4105
```

## Notes
- The site is **noindex by default** (robots meta, `X-Robots-Tag`, `robots.txt`). Set `NEXT_PUBLIC_NOINDEX=false` to lift it.
- `NEXT_PUBLIC_SITE_URL` sets the canonical origin (default `https://fieldstone-fern-demo.vercel.app`).
- Forms validate and show success states but send nothing.
- Content lives in `src/content/*`. Photo credits are in `public/images/SOURCES.md`.
- `scripts/optimize-images.mjs` resizes source photos to 2000px masters and regenerates `src/content/image-meta.json`.
