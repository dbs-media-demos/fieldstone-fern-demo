export type Review = { name: string; where: string; date: string; rating: number; text: string; service: string };

/** Fictional reviews for the concept site. */
export const reviews: Review[] = [
  { name: "Dana H.", where: "Timarron, Southlake", date: "2026-08-14", rating: 5, service: "Patio & fire pit", text: "We went from never using the backyard to eating dinner out there five nights a week. The flagstone is perfectly flat after a full summer, and Luis's crew cleaned up every single day." },
  { name: "Greg W.", where: "Bridlewood, Flower Mound", date: "2026-07-30", rating: 5, service: "Weekly lawn care", text: "Same crew every Thursday for two years. I get a text the night before and a photo when they leave. The lawn went from scorched patches to the best on the street." },
  { name: "Priya S.", where: "Hidden Lakes, Keller", date: "2026-07-02", rating: 5, service: "Xeriscape front yard", text: "Our July water bill dropped by more than half. It doesn't look like a rock yard at all. Neighbors stop and ask for the plant list." },
  { name: "Marcus T.", where: "Ross Downs, Colleyville", date: "2026-06-21", rating: 5, service: "Outdoor kitchen", text: "Hannah's 3D design was exactly what got built, down to where the smoker vents. Sunday brisket for twelve is a tradition now." },
  { name: "Robert K.", where: "Historic District, Grapevine", date: "2026-05-18", rating: 5, service: "Landscape lighting", text: "They came back after dark with test lights before we committed to anything. The oaks look incredible, and there's zero glare into the neighbors' windows." },
  { name: "Alexis R.", where: "Tanglewood, Fort Worth", date: "2026-05-03", rating: 5, service: "Pool garden", text: "It feels like a boutique hotel. They picked plants that don't drop leaves in the pool, which I didn't even know was a thing to ask for." },
  { name: "Jennifer L.", where: "Carillon, Southlake", date: "2026-04-11", rating: 5, service: "Weekly lawn care", text: "Four years with the same crew lead. When our dog chewed a sprinkler head, they fixed it the same visit and just added it to the invoice. That's the service." },
  { name: "Tom B.", where: "Stone Glen, Keller", date: "2026-03-26", rating: 5, service: "Irrigation", text: "Our old system was watering the street. They re-headed three zones, installed a smart controller, and the bill dropped 38% the very next month." },
  { name: "Maria G.", where: "Wellington, Flower Mound", date: "2026-03-09", rating: 4, service: "Spring cleanup", text: "Big crew, done in one day, beds edged beautifully. They had to come back once for a missed corner of mulch but did it within 48 hours without me asking twice." },
  { name: "Kevin & Laura P.", where: "Southlake Woods, Southlake", date: "2026-02-15", rating: 5, service: "Tree & shrub care", text: "Their arborist explained why they wouldn't touch our oaks until July: oak wilt. Two other companies were happy to prune in March. That told us everything." },
  { name: "Samantha J.", where: "Mira Vista, Fort Worth", date: "2026-01-28", rating: 5, service: "Landscape design", text: "The design consult alone was worth it. They saved the old crepe myrtles I thought had to go and built the whole garden around them." },
  { name: "Brian O.", where: "Silverlake, Grapevine", date: "2025-12-04", rating: 5, service: "Leaf removal", text: "Post oaks drop leaves until January here. They came weekly through the whole season and the gutters were done too. No bags left at the curb, ever." },
];

export const ratingBreakdown = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

export type Faq = { q: string; a: string; group: string };

export const faqs: Faq[] = [
  { group: "Lawn care", q: "Is it really the same crew every week?", a: "Yes. Your yard is assigned to one crew lead and their team on a fixed day. Your crew lead's name and cell number are on your welcome card. If a lead is out sick, their assistant runs the route, so you still see a familiar face." },
  { group: "Lawn care", q: "How does text-before-arrival work?", a: "You get a text the evening before your visit, an 'on our way' text about 20 minutes out, and a photo of the finished yard. You can reply to any of them and reach the office." },
  { group: "Lawn care", q: "Do I have to sign a contract?", a: "No. Lawn plans are month-to-month with a fixed monthly price. Pause for vacations or cancel anytime with a week's notice." },
  { group: "Lawn care", q: "What grass types do you work with?", a: "All the North Texas regulars: Bermuda, St. Augustine (including Palmetto and Raleigh), Zoysia and Buffalo grass. Mowing height and feeding are set for your turf, not a one-size default." },
  { group: "Design & build", q: "How does your design process work?", a: "Four steps: an on-site consult, a 3D design with day and dusk renders, installation by one crew lead, then a care plan. The design fee is credited to your install." },
  { group: "Design & build", q: "What does the 1-year plant warranty cover?", a: "Every tree, shrub and perennial we install is guaranteed for 12 months when your property is on one of our care plans. If a plant fails, we replace it, labor included." },
  { group: "Design & build", q: "How far out are you booking installs?", a: "Designs usually start within 2 weeks. Installs are typically scheduled 4–8 weeks out in spring and fall, sooner in summer and winter." },
  { group: "Design & build", q: "Do you design for Texas summers?", a: "It's the whole point. We prioritize natives and adapted plants, drip irrigation and smart controllers. Our water-wise gardens typically use 40–60% less water than turf without looking sparse." },
  { group: "Pricing & service area", q: "Where do you work?", a: "Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth's west and near-south neighborhoods. We also take design-build projects in Trophy Club, Westlake and Roanoke." },
  { group: "Pricing & service area", q: "Are estimates really free?", a: "Yes. Lawn plan and cleanup estimates are free and usually same-week. Design consults are free for projects over $15k; otherwise a $150 fee applies, credited to your project." },
  { group: "Pricing & service area", q: "Are you licensed and insured?", a: "Fully insured with $2M general liability and workers' comp. A TCEQ Licensed Irrigator and an ISA Certified Arborist are on staff, and every crew member is background-checked." },
  { group: "Pricing & service area", q: "How do I pay?", a: "Lawn plans are billed monthly by card or ACH. Projects are billed in milestones: deposit, materials delivery and completion." },
];

export const team = [
  { name: "Daniel Reyes", role: "Founder · Horticulturist", note: "Texas A&M horticulture, 22 seasons in North Texas soil. Still walks every design site himself." },
  { name: "Hannah Brooks", role: "Design Director · Landscape Architect", note: "Leads 3D design and planting plans. Obsessed with Gulf Muhly in October light." },
  { name: "Luis Moreno", role: "Hardscape Lead", note: "Has set more Oklahoma flagstone than anyone we know. Runs every patio build start to finish." },
  { name: "Tyler Kim", role: "Irrigation · TCEQ Licensed Irrigator", note: "Can hear a cracked sprinkler head from the driveway." },
  { name: "Grace Okafor", role: "ISA Certified Arborist", note: "Protects the canopy: oak-wilt-safe pruning, deep-root feeding, health reports." },
  { name: "Andre Walker", role: "Lawn Operations Manager", note: "Builds the weekly routes so your crew and your day never change." },
];

export const stats = [
  { value: 17, suffix: "", label: "seasons in North Texas" },
  { value: 1400, suffix: "+", label: "yards on weekly routes" },
  { value: 4.9, suffix: "★", label: "from 312 Google reviews", decimals: 1 },
  { value: 1, suffix: "-yr", label: "plant warranty" },
];

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
