"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { cities } from "@/content/cities";
import { Arrow } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";

/** Stylized map of the northeast Tarrant County service area (not to exact scale). */
export function ServiceAreaMap() {
  const [active, setActive] = useState("southlake");
  const city = cities.find((c) => c.slug === active)!;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest p-3 sm:p-6">
          <svg viewBox="0 0 420 340" className="h-auto w-full" role="img" aria-labelledby="map-title map-desc">
            <title id="map-title">Service area map</title>
            <desc id="map-desc">
              Stylized map of Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth, with our yard in Southlake at the center.
            </desc>
            <defs>
              <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="#f3ede1" strokeOpacity="0.05" />
              </pattern>
              <radialGradient id="map-glow">
                <stop offset="0" stopColor="#e8b45a" stopOpacity="0.35" />
                <stop offset="1" stopColor="#e8b45a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="420" height="340" fill="url(#map-grid)" />
            {/* Lake Grapevine */}
            <path
              d="M300 58c14-14 34-20 52-12 12 6 26 2 34 12 8 12-4 22-18 26-14 5-18 18-34 18-18 0-22-12-34-16-12-4-12-18 0-28Z"
              fill="#6e7f4e"
              fillOpacity="0.35"
            />
            <text x="336" y="80" fontSize="8" fill="#b9c2a4" fontFamily="var(--font-dm-mono)" textAnchor="middle">
              LAKE GRAPEVINE
            </text>
            {/* Trinity River */}
            <path d="M0 300c40-6 60 10 96 2s60-30 100-24 70 20 110 12 80-10 114-4" fill="none" stroke="#6e7f4e" strokeOpacity="0.5" strokeWidth="2" />
            {/* Highways */}
            <g fill="none" stroke="#f3ede1" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round">
              <path d="M140 64C190 80 230 96 268 104s60 14 92 30 60 20 60 20" />
              <path d="M318 126c-24 20-50 42-80 60s-70 44-110 70-70 40-90 50" />
              <path d="M62 340c14-50 34-100 52-140s24-100 36-200" />
              <path d="M10 250c40-30 90-40 130-30s50 60 20 90-100 40-130 20" strokeDasharray="0" />
            </g>
            <g fontFamily="var(--font-dm-mono)" fontSize="7" fill="#f3ede1" fillOpacity="0.4">
              <text x="200" y="88">
                SH 114
              </text>
              <text x="150" y="236">SH 121</text>
              <text x="116" y="60">
                I-35W
              </text>
              <text x="20" y="236">
                I-820
              </text>
            </g>
            {/* DFW */}
            <rect x="366" y="176" width="40" height="52" rx="6" fill="none" stroke="#f3ede1" strokeOpacity="0.25" strokeDasharray="3 3" />
            <text x="386" y="206" fontSize="8" fill="#f3ede1" fillOpacity="0.45" fontFamily="var(--font-dm-mono)" textAnchor="middle">
              DFW
            </text>
            {/* service radius */}
            <circle cx="268" cy="112" r="200" fill="none" stroke="#e8b45a" strokeOpacity="0.25" strokeDasharray="2 6" />
            <circle cx="268" cy="112" r="90" fill="url(#map-glow)" />

            {cities.map((c) => {
              const isActive = c.slug === active;
              return (
                <g
                  key={c.slug}
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.name}: ${c.drive}`}
                  aria-pressed={isActive}
                  onPointerEnter={() => setActive(c.slug)}
                  onFocus={() => setActive(c.slug)}
                  onClick={() => setActive(c.slug)}
                  className="cursor-pointer outline-none [&:focus-visible_circle.ring]:stroke-lantern"
                >
                  <circle cx={c.map.x} cy={c.map.y} r="22" fill="transparent" />
                  <circle
                    className="ring"
                    cx={c.map.x}
                    cy={c.map.y}
                    r={isActive ? 14 : 8}
                    fill="none"
                    stroke="#e8b45a"
                    strokeOpacity={isActive ? 0.9 : 0.35}
                    style={{ transition: "r 500ms var(--ease-out-expo), stroke-opacity 300ms" }}
                  />
                  <circle cx={c.map.x} cy={c.map.y} r={c.slug === "southlake" ? 5 : 3.5} fill={isActive ? "#e8b45a" : "#f3ede1"} />
                  <text
                    x={c.map.x + (c.slug === "fort-worth" ? 16 : 0)}
                    y={c.map.y + (c.slug === "fort-worth" ? 4 : c.slug === "flower-mound" ? -16 : 28)}
                    textAnchor={c.slug === "fort-worth" ? "start" : "middle"}
                    fontSize="11"
                    fill="#f3ede1"
                    fillOpacity={isActive ? 1 : 0.7}
                    fontFamily="var(--font-fraunces)"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="t-eyebrow absolute bottom-4 left-5 text-sage/70 sm:bottom-6 sm:left-8">Not to scale · crews on route daily</p>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-line bg-surface">
          <div className="relative aspect-[16/10]">
            {cities.map((c) => (
              <div key={c.slug} className={clsx("absolute inset-0 transition-opacity duration-700", c.slug === active ? "opacity-100" : "opacity-0")}>
                <Photo slug={c.hero} sizes="(min-width: 1024px) 38vw, 100vw" decorative />
              </div>
            ))}
          </div>
          <div className="p-6 sm:p-8" aria-live="polite">
            <p className="t-eyebrow text-accent">{city.drive}</p>
            <h3 className="t-h3 mt-3">{city.name}, TX</h3>
            <p className="mt-3 text-muted">{city.yards}</p>
            <p className="mt-2 text-sm text-faint">{city.neighborhoods.slice(0, 5).join(" · ")}</p>
            <Link
              href={`/service-areas/${city.slug}`}
              className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-current pb-1 font-medium"
            >
              Landscaping in {city.name} <Arrow />
            </Link>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 lg:hidden">
          {cities.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setActive(c.slug)}
                aria-pressed={c.slug === active}
                className={clsx(
                  "min-h-11 rounded-full border px-4 text-sm",
                  c.slug === active ? "border-forest bg-forest text-cream" : "border-line",
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
