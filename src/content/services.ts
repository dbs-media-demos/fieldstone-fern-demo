export type Service = {
  slug: string;
  name: string;
  short: string;
  /** Shown in the services index list and meta descriptions. */
  summary: string;
  schemaType: string;
  hero: string;
  images: string[];
  priceNote: string;
  intro: string;
  included: { title: string; text: string }[];
  process: { title: string; text: string }[];
  stats: { value: string; label: string }[];
  faqs: { q: string; a: string }[];
  kind: "recurring" | "project";
};

export const services: Service[] = [
  {
    slug: "lawn-care",
    name: "Weekly lawn care",
    short: "Lawn care",
    kind: "recurring",
    summary:
      "Same-crew weekly mowing, crisp edges, a 7-step fertilization and weed-control program, and a text before we arrive.",
    schemaType: "Lawn care",
    hero: "estate-lawn-hedges",
    images: ["crew-mowing", "string-trimmer", "lawn-stripes-shadow", "striped-lawn", "mower-closeup", "summer-grass"],
    priceNote: "From $45 per visit · most Southlake yards $210–$360 / month",
    intro:
      "The same three-person crew, the same day, every week. They learn your yard: where the St. Augustine thins under the live oak, which sprinkler head the dog keeps kicking, how you like the stripes. You get a text the evening before and a photo when we leave.",
    included: [
      { title: "Mow, edge, trim, blow", text: "Sharpened blades set to the right height for your turf: Bermuda, St. Augustine or Zoysia. Hard edges on every bed and walk, clippings off the drive." },
      { title: "7-step turf program", text: "Pre-emergent in February and September, slow-release feeding through summer, spot weed control every visit. Soil-tested, not guessed." },
      { title: "Text-before-arrival", text: "A heads-up the evening before, an 'on our way' text, and a finished-yard photo in your inbox. Gates closed, pets respected." },
      { title: "Same crew, same day", text: "Your crew lead's name and number are on your welcome card. If something's off, you call a person who has actually walked your lawn." },
      { title: "Seasonal extras", text: "Core aeration, dethatching, top-dressing and overseeding, scheduled when your grass can actually use them." },
      { title: "Irrigation check-ins", text: "Monthly controller tune-ups so you water for the season, not for July in October. Included on Signature and Estate plans." },
    ],
    process: [
      { title: "Walk the yard", text: "A 20-minute visit to measure turf, check soil and note trouble spots." },
      { title: "Pick a plan", text: "Essential, Signature or Estate, with a fixed monthly price and no contracts." },
      { title: "Meet your crew", text: "First visit within 7 days. Same crew and day every week after that." },
    ],
    stats: [
      { value: "1,400+", label: "yards on weekly routes" },
      { value: "96%", label: "customers renew every spring" },
      { value: "7 days", label: "from call to first cut" },
    ],
    faqs: [
      { q: "Do I need to sign a contract?", a: "No. Plans are month-to-month. Most customers stay for years because the crew stays the same, not because of paperwork." },
      { q: "What happens when it rains on my day?", a: "We shift the route by a day and text you. We never mow saturated St. Augustine: it tears the turf and ruts the yard." },
      { q: "Do you bag clippings?", a: "We mulch by default because it feeds the lawn. We bag on request, and always for the first spring cut and before overseeding." },
    ],
  },
  {
    slug: "landscape-design",
    name: "Landscape design & planting",
    short: "Landscape design",
    kind: "project",
    summary:
      "Consult, 3D design, install and care plan. Gardens built for North Texas clay and August heat, backed by a 1-year plant warranty.",
    schemaType: "Landscape design",
    hero: "garden-path-perennials",
    images: ["purple-border", "grasses-coneflower", "salvia", "planting-golden", "gloves-planting", "russian-sage"],
    priceNote: "Design fee $650–$1,800 (credited to install) · installs typically $12k–$85k",
    intro:
      "Good Texas gardens are designed for August, not April. We start with your soil, your sun and how you actually live outside, then draw a planting plan in 3D so you can walk it before a single shovel goes in. Water-wise by default, never sparse.",
    included: [
      { title: "On-site consult", text: "90 minutes with a designer: sun mapping, soil probe, drainage, the views you want to frame and the ones you want to hide." },
      { title: "3D design & plant palette", text: "A to-scale model with day and dusk renders, plus a plant list that mixes natives, adapted perennials and structure." },
      { title: "Bed prep that lasts", text: "We break up Blackland clay, amend with expanded shale and compost, then finish with steel edging and 3\" hardwood mulch." },
      { title: "Water-wise planting", text: "Drip zones, native grasses and Texas-tough perennials. Our gardens typically use 40–60% less water than lawn." },
      { title: "1-year plant warranty", text: "Every plant we install is covered for a full year when it's on our care plan. If it fails, we replace it, labor included." },
      { title: "Care plan", text: "Monthly or quarterly garden visits for pruning, deadheading, feeding and seasonal color, so the design grows in, not over." },
    ],
    process: [
      { title: "Consult", text: "We walk the property with you and set a realistic budget range on day one." },
      { title: "3D design", text: "Two design rounds in about three weeks, with renders, plant boards and a fixed quote." },
      { title: "Install", text: "One crew lead from first stake to final walkthrough. Most gardens take 1–3 weeks." },
      { title: "Care plan", text: "We keep it thriving, and the 1-year warranty stays active." },
    ],
    stats: [
      { value: "620+", label: "gardens designed since 2009" },
      { value: "−52%", label: "average water use vs. turf" },
      { value: "1 yr", label: "plant warranty" },
    ],
    faqs: [
      { q: "Is the design fee credited back?", a: "Yes. When we install the design, the full design fee comes off your install invoice." },
      { q: "Can you work with what I already have?", a: "Absolutely. Mature oaks, good shrubs and existing stone are usually the best parts of a yard. We design around them." },
      { q: "When is the best time to plant in North Texas?", a: "Fall (October–November) is ideal: warm soil and cool air let roots settle before summer. Spring works well too with the right irrigation." },
    ],
  },
  {
    slug: "hardscaping",
    name: "Hardscaping, patios & outdoor kitchens",
    short: "Hardscaping",
    kind: "project",
    summary:
      "Flagstone patios, seat walls, walkways, retaining walls, fire features and full outdoor kitchens, engineered for expansive Texas clay.",
    schemaType: "Hardscaping",
    hero: "patio-firepit-house",
    images: ["circular-patio", "curved-stone-steps", "outdoor-kitchen-island", "flagstone-path", "stone-wall", "firepit-evening"],
    priceNote: "Patios $22–$48 / sq ft · outdoor kitchens $28k–$95k",
    intro:
      "Stone should outlast the house. Our patios sit on engineered bases sized for Blackland clay that swells and shrinks with every drought and downpour. The result is flagstone that stays flat, walls that stay plumb and kitchens you'll cook in for twenty years.",
    included: [
      { title: "Patios & walkways", text: "Oklahoma flagstone, Lueders limestone, travertine and porcelain pavers, dry-laid or mortar-set on a compacted 6\" base." },
      { title: "Outdoor kitchens", text: "Stone-clad islands with built-in grills, smokers, pizza ovens, refrigeration and granite or concrete tops. Gas and electrical coordinated." },
      { title: "Fire features", text: "Gas and wood-burning fire pits, fireplaces and fire bowls with code-compliant clearances and spark-safe seating." },
      { title: "Seat & retaining walls", text: "Natural stone and segmental walls with proper drainage and geogrid. We engineer anything over 4 feet." },
      { title: "Pergolas & shade", text: "Cedar and steel pergolas, louvered roofs and shade sails positioned by the sun path we map at consult." },
      { title: "5-year workmanship warranty", text: "If a stone heaves or a joint fails because of our work, we come back and fix it. Five years, in writing." },
    ],
    process: [
      { title: "Consult & site survey", text: "Grades, drainage, utilities and HOA requirements are all checked before design starts." },
      { title: "3D design & fixed quote", text: "Renders at day and dusk, material samples on your patio, one price." },
      { title: "Build", text: "Permits, excavation, base, stone, lighting and planting, managed by one crew lead." },
      { title: "Walkthrough", text: "Sealing, care guide and your warranty certificate." },
    ],
    stats: [
      { value: "340+", label: "patios & kitchens built" },
      { value: "5 yr", label: "workmanship warranty" },
      { value: "4–7 wks", label: "typical build time" },
    ],
    faqs: [
      { q: "Do you handle permits and HOA approval?", a: "Yes. We prepare the drawings for your HOA and pull city permits in Southlake, Keller, Colleyville, Grapevine, Flower Mound and Fort Worth." },
      { q: "Will a patio crack on clay soil?", a: "Not ours. We excavate deeper, stabilize the sub-grade and use a flexible base designed for soil movement. That's what the 5-year warranty is for." },
      { q: "Can you add lighting and irrigation at the same time?", a: "We recommend it. Running sleeves and low-voltage lines before the stone goes down saves you thousands later." },
    ],
  },
  {
    slug: "outdoor-lighting",
    name: "Outdoor & landscape lighting",
    short: "Outdoor lighting",
    kind: "project",
    summary:
      "Warm 2700K LED uplighting, path and patio lighting on smart timers. Your oaks, your stone and your house, lit like a photograph after dark.",
    schemaType: "Landscape lighting",
    hero: "craftsman-dusk",
    images: ["lit-shrubs", "recessed-path-lights", "garden-night-glow", "lit-garden-trees", "house-dusk-lawn", "pool-dusk"],
    priceNote: "Systems from $3,800 · typical front + back $7k–$16k",
    intro:
      "Most yards disappear at sunset, and in Texas that's when you finally want to be outside. We light with restraint: warm 2700K, fixtures hidden, glare controlled. Moonlighting in the oaks, soft washes on stone, just enough light on the path. Then a smart timer handles it forever.",
    included: [
      { title: "Night design session", text: "We come back after dark with test fixtures so you see the effect in your yard before you buy anything." },
      { title: "Solid brass fixtures", text: "Cast brass and copper fixtures that patina instead of rusting. Lifetime warranty on the fixture bodies." },
      { title: "Uplighting & moonlighting", text: "Oaks lit from below and from within the canopy, so the branches throw shadows on the lawn like moonlight." },
      { title: "Path, step & patio light", text: "Low-glare path lights, recessed step lights and under-cap lights built into seat walls." },
      { title: "Smart control", text: "App and astronomical-timer control with zones for front, back and patio. Adjust it from the couch." },
      { title: "Annual tune-up", text: "Each spring we re-aim fixtures around new growth, clean lenses and check every connection." },
    ],
    process: [
      { title: "Night demo", text: "Live test lighting in your yard, about 45 minutes after sunset." },
      { title: "Lighting plan", text: "Fixture map, beam angles, zones and one fixed price." },
      { title: "Install", text: "Wire buried 6\" deep, connections sealed. Most systems take 1–2 days." },
      { title: "Aim & tune", text: "A second evening visit to fine-tune every beam." },
    ],
    stats: [
      { value: "2700K", label: "warm white, every fixture" },
      { value: "Lifetime", label: "warranty on brass fixtures" },
      { value: "~$4 / mo", label: "typical LED running cost" },
    ],
    faqs: [
      { q: "How much does it cost to run?", a: "A typical 20-fixture LED system uses about as much power as two old incandescent bulbs, roughly $3–5 a month in North Texas." },
      { q: "Can you light existing landscaping?", a: "Yes, that's most of our lighting work. We trench carefully around roots and beds and restore anything we touch." },
      { q: "Will it bother my neighbors?", a: "We design for zero glare: shielded fixtures, careful aiming and warm color. Neighbors usually ask who did it." },
    ],
  },
  {
    slug: "irrigation",
    name: "Irrigation & sprinkler repair",
    short: "Irrigation",
    kind: "recurring",
    summary:
      "Sprinkler repair, smart controllers, drip conversions and water-wise audits by a TCEQ Licensed Irrigator. Most repairs done same week.",
    schemaType: "Irrigation",
    hero: "sprinklers-golden",
    images: ["sprinkler-lawn", "sprinkler-bed", "drip-irrigation", "drip-line", "summer-lawn-trees", "hands-grass"],
    priceNote: "$95 diagnostic (credited to repair) · smart controller installed from $480",
    intro:
      "Half the water a North Texas lawn gets is wasted: heads spraying the street, zones running at noon, a controller still set for July. Our licensed irrigators fix what's broken, then tune the whole system to your soil, your sun and your city's watering schedule.",
    included: [
      { title: "Sprinkler repair", text: "Broken heads, leaking valves, cut lines and dead zones. Our trucks stock the parts, so most fixes are done in one visit." },
      { title: "Smart controllers", text: "Weather-based controllers that skip after rain and adjust to evapotranspiration. They often pay for themselves in a summer." },
      { title: "Drip conversions", text: "Beds moved from spray to drip: water at the roots, no overspray, no wet foliage, far fewer fungal problems." },
      { title: "Water-wise audit", text: "A full catch-cup audit with a zone-by-zone schedule built for Fort Worth and Southlake watering rules." },
      { title: "Backflow testing", text: "Annual backflow prevention testing and city filing by a licensed tester." },
      { title: "Freeze prep", text: "Winterizing, backflow insulation and a system restart in spring, so a February freeze doesn't split your pipes." },
    ],
    process: [
      { title: "Book a diagnostic", text: "Usually within 3 business days, often the next day in season." },
      { title: "Zone-by-zone check", text: "We run every zone with you and show you exactly what's wrong." },
      { title: "Fix & tune", text: "Repairs, a smarter schedule and a written summary of what changed." },
    ],
    stats: [
      { value: "−38%", label: "average water savings after audit" },
      { value: "92%", label: "repairs finished on first visit" },
      { value: "TCEQ", label: "Licensed Irrigator on staff" },
    ],
    faqs: [
      { q: "What are the watering rules in my city?", a: "Fort Worth allows twice-weekly watering on assigned days, with no sprinkler use between 10 am and 6 pm. Southlake and Keller have similar schedules. We program your controller to match yours." },
      { q: "Do you service systems you didn't install?", a: "Yes. We work on every major brand: Rain Bird, Hunter, Toro, Orbit and Rachio." },
      { q: "How do I know if I have a leak?", a: "A soggy spot that never dries, a water bill that jumps, or a zone with weak pressure. Call us; the diagnostic is credited toward the repair." },
    ],
  },
  {
    slug: "seasonal-cleanups",
    name: "Seasonal cleanups & mulching",
    short: "Seasonal cleanups",
    kind: "recurring",
    summary:
      "Spring and fall cleanups, leaf removal, bed refreshes, mulching, seasonal color and freeze prep, scheduled before you have to ask.",
    schemaType: "Yard cleanup",
    hero: "fall-lawn-leaves",
    images: ["fall-raking", "mulch", "mulch-dark", "spring-garden-sun", "orange-blooms", "winter-frost-leaf"],
    priceNote: "Cleanups from $325 · mulch installed from $95 / cubic yard",
    intro:
      "North Texas yards have four real turning points: a spring wake-up, a summer survival stretch, an oak-leaf avalanche in November and a surprise freeze or two. We schedule a visit for each one, so your beds look finished all year and plants go into each season ready.",
    included: [
      { title: "Spring wake-up", text: "Cut back ornamental grasses and perennials, clear winter debris, re-edge beds and pre-emergent before the weeds do." },
      { title: "Fresh mulch", text: "Native hardwood or pine straw at a true 3\" depth. It holds moisture, cools roots and keeps weeds down." },
      { title: "Leaf removal", text: "Weekly leaf pickup in November and December, then a final vacuum of beds and gutters." },
      { title: "Seasonal color", text: "Fall pansies and cool-season annuals, summer lantana and vinca, planted in beds and containers." },
      { title: "Freeze prep", text: "Frost cloth for tender plants, irrigation winterizing and a post-freeze damage check." },
      { title: "Haul-away included", text: "Everything we cut, rake or pull leaves with us. Nothing left at the curb." },
    ],
    process: [
      { title: "Pick your seasons", text: "One visit or all four, booked once." },
      { title: "We schedule it", text: "You get a text a week ahead of each visit." },
      { title: "Done by dinner", text: "Most cleanups take a single day with a full crew." },
    ],
    stats: [
      { value: "4", label: "seasonal visits per year" },
      { value: "3\"", label: "true mulch depth, measured" },
      { value: "0", label: "bags left at the curb" },
    ],
    faqs: [
      { q: "When should I book a fall cleanup?", a: "Live oaks and red oaks drop in waves from November into January, so we schedule two or three leaf visits rather than one big one." },
      { q: "Is mulch really necessary every year?", a: "In Texas, yes. Hardwood mulch breaks down in 9–12 months in our heat. A fresh layer each spring protects roots through summer." },
      { q: "Can you just do the leaves?", a: "Sure. Leaf-only service is available weekly or bi-weekly through the season." },
    ],
  },
  {
    slug: "tree-shrub-care",
    name: "Tree & shrub care",
    short: "Tree & shrub care",
    kind: "recurring",
    summary:
      "Oak-wilt-safe pruning, hedge shaping, deep-root feeding and health checks by an ISA Certified Arborist. Your canopy, cared for properly.",
    schemaType: "Tree care",
    hero: "arborist",
    images: ["arborist-climb", "arborist-saw", "hedge-trimmer", "hedge-trim-top", "pruning-shears", "oak-sunset"],
    priceNote: "Shrub care from $85 / visit · tree pruning quoted per tree after inspection",
    intro:
      "The oaks are the reason Southlake and Colleyville look the way they do, and they can take a century to replace. Our ISA Certified Arborist inspects before anyone cuts. We follow Texas oak-wilt rules: no oak pruning from February through June, and every cut sealed.",
    included: [
      { title: "Structural pruning", text: "Crown cleaning, raising and thinning to reduce storm risk and let light reach the lawn below." },
      { title: "Oak-wilt-safe practices", text: "No oak cuts February–June, sanitized tools between trees and wound paint on every oak cut, per Texas A&M Forest Service guidance." },
      { title: "Hedge & shrub shaping", text: "Hand-shaped hedges, boxwoods and hollies, never shearing into lollipops. Monthly or quarterly." },
      { title: "Deep-root feeding", text: "Slow-release nutrients injected at the root zone in fall and spring, especially for stressed or newly planted trees." },
      { title: "Health checks", text: "An annual canopy and trunk inspection with a written report and photos." },
      { title: "Storm response", text: "Priority callouts for plan customers after North Texas storms and ice." },
    ],
    process: [
      { title: "Arborist inspection", text: "Free for plan customers, $120 otherwise and credited to the work." },
      { title: "Written plan", text: "What to prune, when and why, with a fixed price per tree." },
      { title: "Care on schedule", text: "Shrubs monthly or quarterly, trees on the right season." },
    ],
    stats: [
      { value: "ISA", label: "Certified Arborist on staff" },
      { value: "0", label: "oak cuts Feb–June" },
      { value: "2 hr", label: "storm response for plan customers" },
    ],
    faqs: [
      { q: "Why can't you prune my oak in spring?", a: "Fresh cuts from February through June attract the beetles that spread oak wilt, a fatal disease in North Texas. We schedule oak work for July through January." },
      { q: "Do you remove trees?", a: "We handle small removals and stump grinding. For large removals we bring in a trusted partner and manage the job for you." },
      { q: "How often should hedges be trimmed?", a: "Most hedges in our area look best with 6–8 light shapings a year rather than 2 hard cuts." },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
