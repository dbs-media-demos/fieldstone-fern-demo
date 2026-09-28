import { site } from "@/content/site";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${suffix}` : `${hh} ${suffix}`;
};

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Open/closed status in the business's own timezone (America/Chicago). */
export function openStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const mins = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);

  const today = site.hours.find((h) => h.days.includes(day));
  if (today && mins >= toMin(today.open) && mins < toMin(today.close)) {
    const left = toMin(today.close) - mins;
    return { open: true, label: left <= 60 ? `Open · closes soon (${fmt(today.close)})` : `Open now · until ${fmt(today.close)}` };
  }
  if (today && mins < toMin(today.open)) return { open: false, label: `Closed · opens ${fmt(today.open)} today` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = site.hours.find((h) => h.days.includes(d));
    if (next) return { open: false, label: `Closed · opens ${i === 1 ? "tomorrow" : DAY[d]} ${fmt(next.open)}` };
  }
  return { open: false, label: "Closed" };
}
