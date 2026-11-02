import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/**
 * Line glyph per service that acts out the job while its row is live (hover/focus on
 * desktop, centred row on phones): grass gets mowed, a bed outline is drawn, pavers
 * are laid, a path light glows, a sprinkler sprays, leaves blow off a rake, a shaggy
 * shrub is trimmed. At rest it is a still drawing. Animations live in globals.css (.sg-*).
 */
export function ServiceGlyph({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={clsx("overflow-visible", className)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {GLYPHS[slug] ?? GLYPHS["lawn-care"]}
    </svg>
  );
}

const GLYPHS: Record<string, ReactNode> = {
  "lawn-care": (
    <>
      <path d="M4 40 H44" />
      {[9, 15, 21, 27, 33, 39].map((x, n) => (
        <path key={x} className="sg-blade" style={i(n)} d={`M${x} 40 Q${x - 1} ${32 - (n % 3) * 2} ${x + 2} ${24 - (n % 2) * 4}`} />
      ))}
      <g className="sg-deck">
        <rect x={0} y={33} width={9} height={5} rx={1.5} fill="var(--accent)" stroke="none" />
        <path d="M1 33 L-4 24" />
      </g>
    </>
  ),
  "landscape-design": (
    <>
      <path className="sg-draw" pathLength={1} d="M6 36 C12 20 22 40 30 26 S40 12 44 14" />
      <circle className="sg-pop" style={i(0)} cx={14} cy={18} r={4} />
      <circle className="sg-pop" style={i(1)} cx={34} cy={36} r={5} />
      <path d="M38 40 L44 34 L46 36 L40 42 Z M38 40 L37 43 L40 42" />
    </>
  ),
  hardscaping: (
    <>
      {[
        [6, 22],
        [19, 22],
        [32, 22],
        [12.5, 31],
        [25.5, 31],
        [6, 40],
        [19, 40],
        [32, 40],
      ].map(([x, y], n) => (
        <rect key={n} className="sg-paver" style={i(n)} x={x} y={y - 7} width={11} height={6} rx={1} />
      ))}
    </>
  ),
  "outdoor-lighting": (
    <>
      <path d="M12 42 H36" />
      <path d="M24 42 V24" />
      <path d="M18 24 H30 L27 17 H21 Z" />
      <g className="sg-glow" stroke="var(--lantern)">
        <path d="M21 28 L14 38 M27 28 L34 38 M24 28 V36" strokeDasharray="2 3" />
        <circle cx={24} cy={21} r={9} fill="var(--lantern)" fillOpacity={0.18} stroke="none" />
      </g>
    </>
  ),
  irrigation: (
    <>
      <path d="M4 42 H44" />
      <path d="M21 42 V33 H27 V42" />
      <path d="M24 33 V30" />
      <path className="sg-spray" d="M24 29 Q14 12 4 30" strokeDasharray="1.5 4" />
      <path className="sg-spray" d="M24 29 Q34 12 44 30" strokeDasharray="1.5 4" />
      <path className="sg-spray" d="M24 29 Q19 18 12 34" strokeDasharray="1.5 4" />
      <path className="sg-spray" d="M24 29 Q29 18 36 34" strokeDasharray="1.5 4" />
    </>
  ),
  "seasonal-cleanups": (
    <>
      <path d="M6 6 L22 34" />
      <path d="M15 37 L29 29 M17 40 L15 37 M20 38 L18 35 M23 36 L21 33 M26 34 L24 31" />
      {[
        [32, 40],
        [38, 34],
        [42, 42],
      ].map(([x, y], n) => (
        <g key={n} transform={`translate(${x} ${y})`}>
          <path className="sg-leaf" style={i(n)} d="M0 0 C3 -4 7 -4 8 -1 C5 2 2 2 0 0 Z M0 0 L6 -2" fill="var(--lantern)" fillOpacity={0.35} />
        </g>
      ))}
    </>
  ),
  "tree-shrub-care": (
    <>
      <path d="M8 43 H40" />
      <path d="M24 43 V30" />
      <circle className="sg-shaggy" cx={24} cy={20} r={13} strokeDasharray="2 2.6" />
      <circle className="sg-neat" cx={24} cy={20} r={10} fill="var(--moss)" fillOpacity={0.25} />
      <path className="sg-shears" d="M36 6 L44 14 M44 6 L36 14" stroke="var(--accent)" />
    </>
  ),
};
