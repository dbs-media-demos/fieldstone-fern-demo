export type Category = "patios" | "lighting" | "planting" | "outdoor-kitchens" | "lawns";

export const categories: { id: Category; label: string }[] = [
  { id: "patios", label: "Patios" },
  { id: "lighting", label: "Lighting" },
  { id: "planting", label: "Planting" },
  { id: "outdoor-kitchens", label: "Outdoor kitchens" },
  { id: "lawns", label: "Lawns" },
];

export type Project = {
  slug: string;
  title: string;
  city: string;
  neighborhood: string;
  year: number;
  category: Category;
  hero: string;
  summary: string;
  story: string[];
  scope: string[];
  facts: { label: string; value: string }[];
  gallery: string[];
  before?: string;
  after?: string;
  quote?: { text: string; name: string };
  services: string[];
};

export const projects: Project[] = [
  {
    slug: "southlake-courtyard-patio",
    title: "The Timarron Courtyard",
    city: "Southlake",
    neighborhood: "Timarron",
    year: 2025,
    category: "patios",
    hero: "patio-firepit-house",
    summary: "A flat, empty backyard turned into an Oklahoma-flagstone courtyard with a gas fire pit, seat walls and layered native planting.",
    story: [
      "The Harmons had a beautiful house and a backyard they never used: a rectangle of tired Bermuda, a fence, and nowhere to sit that wasn't in full sun.",
      "We pulled the living space out from the back door with a 1,150 sq ft flagstone courtyard, sheltered by curved seat walls that double as extra seating for thirty. A gas fire pit anchors the center, and every wall hides warm under-cap lighting.",
      "Planting is layered and water-wise: Little Bluestem, Gulf Muhly and Texas Sage soften the stone, with a single multi-trunk Mexican Plum that blooms white every March.",
    ],
    scope: ["Oklahoma flagstone patio, 1,150 sq ft", "Curved limestone seat walls", "Gas fire pit with auto-ignition", "Under-cap wall lighting", "Drip-irrigated native beds"],
    facts: [
      { label: "Timeline", value: "5 weeks" },
      { label: "Investment", value: "$60k–$75k" },
      { label: "Patio", value: "1,150 sq ft" },
      { label: "Water use", value: "−44%" },
    ],
    gallery: ["circular-patio", "curved-seating-patio", "curved-stone-steps", "firepit-evening", "adirondack-firepit", "stone-wall"],
    before: "before-empty-yard",
    after: "patio-firepit-house",
    quote: { text: "We went from never using the backyard to eating dinner out there five nights a week. The fire pit is on every evening from October to March.", name: "Dana H." },
    services: ["hardscaping", "landscape-design", "outdoor-lighting"],
  },
  {
    slug: "colleyville-outdoor-kitchen",
    title: "Poolside Kitchen & Pavilion",
    city: "Colleyville",
    neighborhood: "Ross Downs",
    year: 2025,
    category: "outdoor-kitchens",
    hero: "outdoor-kitchen-pool",
    summary: "A covered cedar pavilion with a 16-foot stone kitchen, smoker bay and bar seating, opening straight onto the pool deck.",
    story: [
      "A family of six who cook for crowds every weekend. They wanted to stop running between the indoor kitchen and the grill.",
      "We designed a 16-foot island with a 42\" grill, an offset smoker bay, two refrigerated drawers and a leathered-granite bar. It's under a cedar pavilion with ceiling fans and heaters, so it works in August and January.",
      "The pool deck was re-laid in travertine to match, and a row of Nellie R. Stevens hollies now screens the neighbor's second story.",
    ],
    scope: ["16 ft stone-clad kitchen island", "Cedar pavilion with fans & heaters", "Travertine pool deck", "Holly privacy screen", "Gas, electric and water rough-in"],
    facts: [
      { label: "Timeline", value: "7 weeks" },
      { label: "Investment", value: "$85k–$95k" },
      { label: "Kitchen", value: "16 ft island" },
      { label: "Seats", value: "8 at the bar" },
    ],
    gallery: ["outdoor-kitchen-bar", "outdoor-kitchen-island", "pool-kitchen-patio", "covered-patio", "pergola", "outdoor-fireplace"],
    before: "before-bare-yard",
    after: "outdoor-kitchen-pool",
    quote: { text: "Every Sunday it's brisket and twelve people. We haven't cooked indoors on a weekend since.", name: "Marcus T." },
    services: ["hardscaping", "outdoor-lighting"],
  },
  {
    slug: "keller-xeriscape-front-yard",
    title: "Water-wise Front Yard",
    city: "Keller",
    neighborhood: "Hidden Lakes",
    year: 2024,
    category: "planting",
    hero: "xeriscape-yucca",
    summary: "A thirsty, weedy front lawn replaced with a sculptural xeriscape of agave, red yucca and native grasses. Water use is down 61%.",
    story: [
      "Their front lawn drank more water than the rest of the house combined, and still went brown every August.",
      "We removed 2,400 sq ft of turf, regraded to slow the runoff and laid a limestone gravel garden with boulders pulled from a Texas quarry. Red yucca, Whale's Tongue agave, Mexican feathergrass and Blackfoot daisy fill it, all on drip.",
      "It isn't a rock yard. It's lush from March to November and still looks designed in winter. The HOA asked for the plant list.",
    ],
    scope: ["Turf removal, 2,400 sq ft", "Regrading & dry creek bed", "Limestone gravel & boulders", "Native & adapted planting", "Full drip conversion"],
    facts: [
      { label: "Timeline", value: "2 weeks" },
      { label: "Investment", value: "$18k–$24k" },
      { label: "Water use", value: "−61%" },
      { label: "Mowing", value: "Never again" },
    ],
    gallery: ["xeriscape-cactus", "red-yucca", "agave", "fountain-grass", "grasses-backlit", "golden-grasses"],
    before: "before-weedy-lot",
    after: "xeriscape-yucca",
    quote: { text: "Our July water bill dropped by more than half, and people stop on their walks to look at it.", name: "Priya S." },
    services: ["landscape-design", "irrigation"],
  },
  {
    slug: "grapevine-evening-lighting",
    title: "Oak Canopy Lighting",
    city: "Grapevine",
    neighborhood: "Historic District",
    year: 2025,
    category: "lighting",
    hero: "craftsman-dusk",
    summary: "Forty-two warm brass fixtures that moonlight two century-old post oaks and turn a craftsman home into the prettiest house on the street after dark.",
    story: [
      "Two 100-year-old post oaks frame this 1920s craftsman. After sunset, the whole property went black.",
      "We placed six uplights and four canopy-mounted moonlights in the oaks, so the branches cast soft shadows across the lawn. Path lights follow the brick walk, and small wash lights pick out the stonework on the porch.",
      "Everything runs on three smart zones and an astronomical timer. The owners haven't touched a switch since the install.",
    ],
    scope: ["42 cast-brass fixtures", "Canopy moonlighting in 2 post oaks", "Brick-walk path lighting", "Porch & stone wash lighting", "3-zone smart control"],
    facts: [
      { label: "Timeline", value: "3 days" },
      { label: "Investment", value: "$14k–$17k" },
      { label: "Fixtures", value: "42 × 2700K" },
      { label: "Running cost", value: "≈ $5 / month" },
    ],
    gallery: ["craftsman-dusk-2", "lit-shrubs", "recessed-path-lights", "garden-night-glow", "lit-garden-trees", "house-dusk-lawn"],
    quote: { text: "We sit on the porch every night now. The oaks look like a stage set.", name: "Robert & Ellen K." },
    services: ["outdoor-lighting", "tree-shrub-care"],
  },
  {
    slug: "flower-mound-lawn-renovation",
    title: "Estate Lawn Renovation",
    city: "Flower Mound",
    neighborhood: "Bridlewood",
    year: 2024,
    category: "lawns",
    hero: "estate-lawn-hedges",
    summary: "An acre of patchy, drought-scorched Bermuda brought back with soil correction, a new sprinkler layout and a weekly same-crew program.",
    story: [
      "Three brutal summers had left the lawn thin, weedy and brown in patches the size of a car.",
      "Soil tests showed compacted clay and a pH problem. We core-aerated twice, top-dressed with compost, corrected the pH and re-sprigged the worst areas with Tif-Grand Bermuda. The old sprinkler system had eleven zones watering pavement. We rebuilt it with matched-precipitation rotors and a smart controller.",
      "Then the weekly crew took over: sharp blades, alternating stripe directions and a 7-step program. By the second summer it was the lawn neighbors asked about.",
    ],
    scope: ["Soil testing & pH correction", "Double core aeration & compost top-dressing", "Sprigging with Tif-Grand Bermuda", "Irrigation redesign & smart controller", "Weekly Estate plan"],
    facts: [
      { label: "Timeline", value: "1 season" },
      { label: "Lawn", value: "0.9 acre" },
      { label: "Water use", value: "−33%" },
      { label: "Plan", value: "Estate, weekly" },
    ],
    gallery: ["striped-lawn", "lawn-stripes-shadow", "estate-driveway", "sprinklers-golden", "front-yard-landscaped", "riding-mower"],
    before: "before-dead-lawn",
    after: "striped-lawn",
    quote: { text: "Same guys every Thursday for two years. They know this lawn better than I do.", name: "Greg W." },
    services: ["lawn-care", "irrigation"],
  },
  {
    slug: "fort-worth-pool-garden",
    title: "Tanglewood Pool Garden",
    city: "Fort Worth",
    neighborhood: "Tanglewood",
    year: 2023,
    category: "planting",
    hero: "pool-garden",
    summary: "A resort-style pool garden with a limestone deck, layered evergreen screening and evening lighting that reflects in the water.",
    story: [
      "The pool was new; everything around it was bare dirt and a builder-grade fence.",
      "We wrapped the pool in Lueders limestone, then planted in layers for privacy that looks natural rather than walled in: Little Gem magnolias, wax myrtle, Soft Caress mahonia and drifts of foxtail fern. Lighting in the planting reflects on the water at night.",
      "All beds are on drip, and the planting palette was chosen to shed as few leaves into the pool as possible.",
    ],
    scope: ["Lueders limestone pool deck", "Layered evergreen privacy planting", "Low-litter plant palette", "Underwater-reflective landscape lighting", "Drip irrigation"],
    facts: [
      { label: "Timeline", value: "6 weeks" },
      { label: "Investment", value: "$48k–$58k" },
      { label: "Screening", value: "Year-round" },
      { label: "Leaf litter", value: "Minimal" },
    ],
    gallery: ["pool-texas", "pool-sunset", "pool-dusk", "pool-patio-dusk", "stone-patio-pool", "garden-sunlit-trees"],
    before: "install-excavator",
    after: "pool-garden",
    quote: { text: "It feels like a boutique hotel, and it's our backyard.", name: "Alexis R." },
    services: ["landscape-design", "hardscaping", "outdoor-lighting"],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Flat gallery for /projects: every project image plus extras, each tagged. */
export type GalleryItem = { id: string; img: string; category: Category; project?: string; caption: string };

const extras: GalleryItem[] = [
  { id: "x-stepping", img: "stepping-stones-lawn", category: "patios", caption: "Stepping-stone path through St. Augustine · Southlake" },
  { id: "x-flagstone", img: "flagstone-path", category: "patios", caption: "Flagstone garden walk · Colleyville" },
  { id: "x-steps", img: "stone-steps-garden", category: "patios", caption: "Natural stone steps · Keller" },
  { id: "x-wall", img: "retaining-wall-garden", category: "patios", caption: "Planted retaining wall · Flower Mound" },
  { id: "x-dusk-hill", img: "house-dusk-hillside", category: "lighting", caption: "Hillside home, dusk lighting · Grapevine" },
  { id: "x-grasses-night", img: "grasses-night", category: "lighting", caption: "Grasses at night · Southlake" },
  { id: "x-coneflower", img: "coneflowers", category: "planting", caption: "Coneflower & salvia border · Colleyville" },
  { id: "x-sage", img: "russian-sage", category: "planting", caption: "Russian sage drift · Keller" },
  { id: "x-perennials", img: "garden-path-perennials", category: "planting", caption: "Perennial path garden · Fort Worth" },
  { id: "x-bluebonnet", img: "bluebonnets-house", category: "planting", caption: "Wildflower meadow edge · Flower Mound" },
  { id: "x-fireplace", img: "outdoor-fireplace", category: "outdoor-kitchens", caption: "Covered fireplace deck · Southlake" },
  { id: "x-lawn-brick", img: "brick-home-lawn", category: "lawns", caption: "Weekly Signature plan · Keller" },
  { id: "x-lawn-front", img: "front-yard-landscaped", category: "lawns", caption: "Front lawn & beds · Southlake" },
  { id: "x-lawn-trees", img: "brick-home-trees", category: "lawns", caption: "Shade-tolerant Zoysia · Colleyville" },
];

export const gallery: GalleryItem[] = [
  ...projects.flatMap((p) =>
    [p.hero, ...p.gallery].map((img, i) => ({
      id: `${p.slug}-${i}`,
      img,
      category: p.category,
      project: p.slug,
      caption: `${p.title} · ${p.city}`,
    })),
  ),
  ...extras,
].filter((g, i, all) => all.findIndex((x) => x.img === g.img) === i);
