"use client";

import { useEffect, useState, type ComponentType } from "react";
import { isPhone, loadMotion } from "@/lib/gsap";

type Bed = ComponentType<{ className?: string }>;

/** The statement's planting bed, desktop only: it's a lot of drawn geometry for a phone to carry. It starts below the fold, so mounting late shows nothing. */
export function LazyPlantingBed({ className }: { className?: string }) {
  const [Bed, setBed] = useState<Bed | null>(null);

  useEffect(() => {
    if (isPhone()) return;
    void Promise.all([import("./PlantingBed"), loadMotion()]).then(([m]) => setBed(() => m.PlantingBed));
  }, []);

  return Bed ? <Bed className={className} /> : null;
}
