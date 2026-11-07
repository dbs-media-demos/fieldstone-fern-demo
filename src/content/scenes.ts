/** Content of the two scroll scenes. Separate from misc.ts because client components import it. */
export const processSteps = [
  { title: "Consult", img: "planting-golden", duration: "Week 1", text: "A designer walks your yard with you: sun, soil, drainage, how you want to live outside, and a realistic budget range on day one.", deliverables: ["Site notes", "Sun map", "Budget range"] },
  { title: "3D design", img: "garden-path-perennials", duration: "Weeks 2–4", text: "A to-scale 3D model with day and dusk views, a plant palette built for Texas heat, and one fixed quote. Two revision rounds included.", deliverables: ["3D renders", "Plant boards", "Fixed quote"] },
  { title: "Install", img: "wheelbarrow", duration: "1–7 weeks", text: "One crew lead from first stake to final walkthrough. Daily cleanup, a text update every afternoon, and no surprise change orders.", deliverables: ["One crew lead", "Daily updates", "5-yr hardscape warranty"] },
  { title: "Care plan", img: "hedge-trimmer", duration: "Every season", text: "The same people who built it keep it thriving: weekly lawn, seasonal garden care and your 1-year plant warranty, active.", deliverables: ["Same crew", "Seasonal visits", "1-yr plant warranty"] },
];

export type Season = {
  id: "spring" | "summer" | "fall" | "winter";
  name: string;
  months: string;
  img: string;
  tint: string;
  accent: string;
  line: string;
  services: string[];
};

export const seasons: Season[] = [
  {
    id: "spring",
    name: "Spring",
    months: "Mar – May",
    img: "spring-redbud",
    tint: "#3a2430",
    accent: "#f2b8c6",
    line: "Redbuds bloom, the Bermuda wakes up, and everything wants to grow at once.",
    services: ["Pre-emergent & first feeding", "Core aeration", "Scalping & first cut", "Bed refresh & fresh mulch", "Irrigation spring start-up"],
  },
  {
    id: "summer",
    name: "Summer",
    months: "Jun – Aug",
    img: "summer-lawn-trees",
    tint: "#2f3314",
    accent: "#f0c95e",
    line: "A hundred-degree August is a test. We plan so your yard passes it.",
    services: ["Weekly mowing, raised height", "Smart-controller tuning", "Grub & chinch-bug watch", "Deep watering, twice weekly", "Summer color: lantana & vinca"],
  },
  {
    id: "fall",
    name: "Fall",
    months: "Sep – Nov",
    img: "fall-red-tree",
    tint: "#3b1d10",
    accent: "#f0955f",
    line: "Best planting weather of the year, then the oak leaves come down.",
    services: ["Fall pre-emergent", "Planting & overseeding", "Weekly leaf removal", "Pansies & cool-season color", "Oak pruning (safe season)"],
  },
  {
    id: "winter",
    name: "Winter",
    months: "Dec – Feb",
    img: "winter-frost-leaf",
    tint: "#1c2a33",
    accent: "#cfe3ee",
    line: "Mild most days, until a blue norther drops it to 18°F overnight.",
    services: ["Irrigation winterizing", "Freeze protection & frost cloth", "Dormant pruning", "Hardscape & lighting installs", "Cut-back of grasses (late Feb)"],
  },
];
