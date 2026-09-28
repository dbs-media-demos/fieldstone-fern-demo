"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Muted background loop that only loads once near the viewport, and never
 * autoplays with reduced motion or Save-Data (the poster stays instead).
 */
export function AutoVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion() || conn?.saveData) return;
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setAllowed(true);
          el.play().catch(() => {});
        } else el.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} className={className} src={allowed ? src : undefined} poster={poster} muted loop playsInline preload="none" aria-hidden />;
}
