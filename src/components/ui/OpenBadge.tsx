"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/hours";

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};
// Strings compare by value, so the snapshot is stable between minute ticks.
const getSnapshot = () => {
  const s = openStatus();
  return `${s.open}|${s.label}`;
};
const getServerSnapshot = () => "";

/** Live "Open now · until 6 pm" pill, computed in Central Time on the client. */
export function OpenBadge({ className }: { className?: string }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, label] = snap ? [snap.startsWith("true"), snap.split("|")[1]] : [false, "Mon–Fri 7–6 · Sat 8–2"];
  return (
    <span className={clsx("inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm", className)}>
      <span
        aria-hidden
        className={clsx("h-2 w-2 rounded-full", snap ? (open ? "pulse-dot bg-[#5fbf6a] text-[#5fbf6a]" : "bg-terracotta-2") : "bg-sage")}
      />
      <span suppressHydrationWarning>{label}</span>
    </span>
  );
}
