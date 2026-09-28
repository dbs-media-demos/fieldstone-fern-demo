import clsx from "clsx";

/**
 * Fieldstone & Fern mark: a cairn of three field stones with a fern fiddlehead
 * unfurling from the top stone. Stones = hardscape, fern = living landscape.
 */
export const MARK = {
  stones: [
    "M9.5 40.2c0-3.4 6.4-6.2 14.5-6.2s14.5 2.6 14.5 5.9c0 3-5.6 5.1-14.2 5.1-8.9 0-14.8-1.8-14.8-4.8Z",
    "M14.2 30.6c.3-2.9 4.6-4.9 10.3-4.7 5.4.2 9.3 2.3 9.1 4.9-.2 2.4-4.4 3.9-9.9 3.8-5.9-.1-9.7-1.6-9.5-4Z",
    "M18.4 22.5c.4-2.1 2.9-3.4 6-3.3 3.2.1 5.5 1.5 5.2 3.4-.3 1.8-2.7 2.8-5.9 2.7-3.3-.1-5.6-1.1-5.3-2.8Z",
  ],
  frond: "M24.4 19.4C24.2 14 22.6 10.2 25 7.1c2.3-3 6.9-3 8.6-.3 1.5 2.4.3 5.4-2.3 5.8-2.2.3-3.6-1.7-2.7-3.4.6-1.1 2.1-1.2 2.7-.3",
  leaflets: [
    "M23.8 15.2c-1.8-.4-3.2-1.6-3.6-3.2 1.7.1 3.1 1.1 3.6 3.2Z",
    "M24.2 12.3c1.3-1.1 1.9-2.6 1.6-4.1-1.3.9-1.9 2.4-1.6 4.1Z",
  ],
};

export function Mark({ className, animate = false, title }: { className?: string; animate?: boolean; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <g fill="currentColor">
        {MARK.stones.map((d, i) => (
          <path key={i} d={d} opacity={1 - i * 0.12} />
        ))}
        {MARK.leaflets.map((d, i) => (
          <path key={i} d={d} className="text-moss" fill="currentColor" />
        ))}
      </g>
      <path
        d={MARK.frond}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={clsx(animate && "fiddle-draw")}
      />
    </svg>
  );
}

export function Logo({ className, animate = false, compact = false }: { className?: string; animate?: boolean; compact?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-9 w-9 shrink-0" animate={animate} />
      {!compact && (
        <span className="font-display text-[1.28rem] leading-none tracking-[-0.02em] whitespace-nowrap">
          Fieldstone <span className="t-italic text-[1.12em] text-accent">&amp;</span> Fern
        </span>
      )}
    </span>
  );
}
