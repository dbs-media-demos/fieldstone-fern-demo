"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/biz-core";
import { useBiz } from "@/components/preview/BizContext";

/** Live "Open now · until 6 pm" pill, computed in the business's time zone on the client. */
export function OpenBadge({ className }: { className?: string }) {
  const biz = useBiz();
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = openStatus(biz);
      setStatus(s ? { open: s.open, label: s.text } : null);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [biz]);

  if (!biz.hours) return null;
  return (
    <span className={clsx("inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm", className)}>
      <span
        aria-hidden
        className={clsx("h-2 w-2 rounded-full", status ? (status.open ? "pulse-dot bg-[#5fbf6a] text-[#5fbf6a]" : "bg-terracotta-2") : "bg-sage")}
      />
      <span suppressHydrationWarning>{status?.label ?? biz.hoursSummary}</span>
    </span>
  );
}
