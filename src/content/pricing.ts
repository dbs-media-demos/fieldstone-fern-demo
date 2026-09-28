/** Lawn-plan estimator. Numbers are illustrative for the concept site. */

export type PlanServiceId = "mowing" | "edging" | "fertilization" | "weeds" | "hedges";

export const planServices: { id: PlanServiceId; label: string; note: string; defaultOn: boolean }[] = [
  { id: "mowing", label: "Mowing", note: "Sharp blades, right height for your turf", defaultOn: true },
  { id: "edging", label: "Edging & trimming", note: "Crisp lines on every bed and walk", defaultOn: true },
  { id: "fertilization", label: "Fertilization", note: "7-step, soil-tested program", defaultOn: true },
  { id: "weeds", label: "Weed control", note: "Pre-emergent + spot treatment in beds", defaultOn: false },
  { id: "hedges", label: "Hedge trimming", note: "Hand-shaped, monthly", defaultOn: false },
];

export type Frequency = "weekly" | "biweekly";

export const frequencies: { id: Frequency; label: string; visits: number; note: string }[] = [
  { id: "weekly", label: "Weekly", visits: 4.33, note: "Best for Bermuda & St. Augustine in season" },
  { id: "biweekly", label: "Every 2 weeks", visits: 2.17, note: "Zoysia, Buffalo or lighter growth" },
];

export const yard = { min: 2000, max: 30000, step: 500, default: 8000 };

export function estimate(sqft: number, selected: PlanServiceId[], freq: Frequency) {
  const k = sqft / 1000;
  const visits = frequencies.find((f) => f.id === freq)!.visits;
  const perVisit = (selected.includes("mowing") ? 35 + 3 * k : 0) + (selected.includes("edging") ? 6 + 0.5 * k : 0);
  const monthlyAddOns =
    (selected.includes("fertilization") ? 25 + 2.5 * k : 0) +
    (selected.includes("weeds") ? 29 : 0) +
    (selected.includes("hedges") ? 45 + 1.5 * k : 0);
  const monthly = Math.round((perVisit * visits + monthlyAddOns) / 5) * 5;
  return { monthly, perVisit: Math.round(perVisit), visits };
}

export const acresLabel = (sqft: number) => {
  const acres = sqft / 43560;
  if (acres < 0.2) return "about ⅛ acre";
  if (acres < 0.32) return "about ¼ acre";
  if (acres < 0.45) return "about ⅓ acre";
  if (acres < 0.6) return "about ½ acre";
  return `about ${acres.toFixed(1)} acre`;
};

export const plans = [
  {
    name: "Essential",
    price: 189,
    blurb: "A sharp, clean lawn every week.",
    features: ["Weekly mow, edge, trim & blow", "Same crew, same day", "Text-before-arrival + photo", "Month-to-month"],
    featured: false,
  },
  {
    name: "Signature",
    price: 279,
    blurb: "The one most Southlake yards choose.",
    features: ["Everything in Essential", "7-step fertilization & weed control", "Quarterly shrub shaping", "Monthly irrigation check-in", "Priority rain-day rescheduling"],
    featured: true,
  },
  {
    name: "Estate",
    price: 449,
    blurb: "For big lots and beds that should look designed.",
    features: ["Everything in Signature", "Monthly hedge & garden care", "Annual core aeration", "Seasonal color twice a year", "1-year plant warranty on installs", "Storm-response priority"],
    featured: false,
  },
];
