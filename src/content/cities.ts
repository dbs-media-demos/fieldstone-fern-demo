export type City = {
  slug: string;
  name: string;
  zips: string[];
  /** Position on the stylized service-area map (viewBox 0 0 400 330). */
  map: { x: number; y: number };
  drive: string;
  hero: string;
  intro: string;
  neighborhoods: string[];
  local: { title: string; text: string }[];
  yards: string;
  review: { text: string; name: string; where: string };
  geo: { lat: number; lng: number };
};

export const cities: City[] = [
  {
    slug: "southlake",
    name: "Southlake",
    zips: ["76092"],
    map: { x: 268, y: 112 },
    drive: "Home base, 0 min",
    hero: "estate-driveway",
    intro:
      "Southlake is home. Our yard is off FM 1709 and most of our weekly crews start their day within ten minutes of Town Square. We know the HOAs, the Blackland clay and exactly how much shade those big post oaks throw by August.",
    neighborhoods: ["Timarron", "Carillon", "Southlake Woods", "Stone Lakes", "Estes Park", "Coventry Manor", "Myers Meadow", "Vista Trails"],
    local: [
      { title: "HOA-ready designs", text: "We prepare submittals for Timarron, Carillon and most Southlake HOAs, and our plans usually clear on the first pass." },
      { title: "Post oak country", text: "Southlake sits on the edge of the Cross Timbers. We prune its oaks only in the safe season and design shade gardens that work under them." },
      { title: "Twice-weekly watering", text: "Controllers are programmed to Southlake's watering schedule and adjusted monthly." },
    ],
    yards: "480+ Southlake yards on weekly routes",
    review: { text: "They built our patio in Carillon and have mowed every Thursday since. Same crew lead, four years running.", name: "Jennifer L.", where: "Carillon, Southlake" },
    geo: { lat: 32.9412, lng: -97.1342 },
  },
  {
    slug: "keller",
    name: "Keller",
    zips: ["76248", "76244", "76262"],
    map: { x: 172, y: 124 },
    drive: "12 min from our yard",
    hero: "brick-home-lawn",
    intro:
      "From Hidden Lakes to the older lots off Keller Parkway, Keller yards are bigger than most, and so are their water bills. We do a lot of lawn renovation, smart irrigation and water-wise front yards here.",
    neighborhoods: ["Hidden Lakes", "Marshall Ridge", "Bear Creek", "Keller Town Center", "Hunters Ridge", "Stonebridge", "Villages of Stone Glen", "Overton Ridge"],
    local: [
      { title: "Big-lot lawn plans", text: "Weekly plans priced for ½–1 acre lots, with commercial ride-on mowers that won't rut soft ground." },
      { title: "Xeriscape that looks lush", text: "Keller's water-conservation rebates pair well with our turf-reduction designs." },
      { title: "Drainage fixes", text: "French drains and dry creek beds for the low spots that flood every spring." },
    ],
    yards: "310+ Keller yards on weekly routes",
    review: { text: "Our front yard used to be a brown lawn every August. Now it's a garden, and the water bill is half.", name: "Priya S.", where: "Hidden Lakes, Keller" },
    geo: { lat: 32.9346, lng: -97.2517 },
  },
  {
    slug: "colleyville",
    name: "Colleyville",
    zips: ["76034"],
    map: { x: 246, y: 172 },
    drive: "9 min from our yard",
    hero: "brick-home-trees",
    intro:
      "Colleyville has the deep lots and mature trees that make great outdoor rooms. Most of our work here is design-build: outdoor kitchens, pool gardens, lighting in century-old oaks and hedges that give real privacy.",
    neighborhoods: ["Ross Downs", "Woodbriar", "Montclair Parc", "Colleyville Estates", "Reserve at Colleyville", "Pleasant Run Estates", "Oak Hollow"],
    local: [
      { title: "Outdoor kitchens", text: "Colleyville's larger lots are ideal for full kitchens and pavilions. We coordinate gas, electrical and permitting." },
      { title: "Privacy planting", text: "Hollies, wax myrtles and magnolias layered so a screen looks like a garden, not a wall." },
      { title: "Tree-safe construction", text: "Root-zone protection and air-spade excavation around protected trees." },
    ],
    yards: "190+ Colleyville yards on weekly routes",
    review: { text: "Sunday brisket for twelve under the pavilion they built. We haven't cooked inside on a weekend since.", name: "Marcus T.", where: "Ross Downs, Colleyville" },
    geo: { lat: 32.8810, lng: -97.1550 },
  },
  {
    slug: "grapevine",
    name: "Grapevine",
    zips: ["76051", "76099"],
    map: { x: 318, y: 126 },
    drive: "11 min from our yard",
    hero: "craftsman-dusk",
    intro:
      "Historic cottages near Main Street, lakeside homes by Lake Grapevine and newer neighborhoods near the vineyards. Grapevine rewards lighting and planting that respect the architecture.",
    neighborhoods: ["Historic District", "Silverlake", "Grapevine Lake Estates", "Hood Lane", "Western Oaks", "Parr Park area", "Dove Loop"],
    local: [
      { title: "Historic-home lighting", text: "Warm, low-glare lighting that flatters craftsman and Victorian homes without looking commercial." },
      { title: "Cottage gardens", text: "Old-fashioned perennials and roses, chosen for Texas heat and trained to look effortless." },
      { title: "Lakeside slopes", text: "Retaining walls and native plantings that hold soil on the slopes near the lake." },
    ],
    yards: "150+ Grapevine yards on weekly routes",
    review: { text: "The oaks look like a stage set at night. We sit on the porch every evening now.", name: "Robert & Ellen K.", where: "Historic District, Grapevine" },
    geo: { lat: 32.9343, lng: -97.0781 },
  },
  {
    slug: "fort-worth",
    name: "Fort Worth",
    zips: ["76107", "76109", "76116", "76132"],
    map: { x: 74, y: 292 },
    drive: "25–35 min · crews on route daily",
    hero: "pool-garden",
    intro:
      "We serve Fort Worth's west side and near-south neighborhoods every weekday. Tanglewood, Westover Hills, Mira Vista and Monticello have gorgeous old canopies and tricky shade, and that's where good design matters most.",
    neighborhoods: ["Tanglewood", "Westover Hills", "Mira Vista", "Monticello", "Rivercrest", "Ridglea", "Park Hill", "Berkeley Place"],
    local: [
      { title: "Fort Worth watering rules", text: "Twice-weekly watering on assigned days and no sprinklers from 10 am to 6 pm. Every controller we touch is programmed to match." },
      { title: "Shade lawns", text: "Zoysia and shade-tolerant St. Augustine for the dappled yards under old live oaks." },
      { title: "Pool gardens", text: "Low-litter planting and limestone decks for west-side pools." },
    ],
    yards: "220+ Fort Worth yards on weekly routes",
    review: { text: "It feels like a boutique hotel, and it's our backyard in Tanglewood.", name: "Alexis R.", where: "Tanglewood, Fort Worth" },
    geo: { lat: 32.7555, lng: -97.3308 },
  },
  {
    slug: "flower-mound",
    name: "Flower Mound",
    zips: ["75022", "75028"],
    map: { x: 300, y: 40 },
    drive: "15 min from our yard",
    hero: "estate-lawn-hedges",
    intro:
      "Flower Mound's big lots and horse-country edges call for serious lawn programs and naturalistic planting. We run daily routes north of the lake, from Bridlewood to Wellington and Canyon Falls.",
    neighborhoods: ["Bridlewood", "Wellington", "Canyon Falls", "Chimney Rock", "Lakeside", "Wichita Trail", "Stone Hill Farms", "Kensington"],
    local: [
      { title: "Acre-lot lawn programs", text: "Estate plans with alternating stripe patterns, aeration and a soil-tested fertility program." },
      { title: "Meadow edges", text: "Native wildflower and bluebonnet meadows where lawn gives way to pasture." },
      { title: "Irrigation redesigns", text: "Rotor systems rebuilt for large, uneven lots, with smart controllers." },
    ],
    yards: "260+ Flower Mound yards on weekly routes",
    review: { text: "Same guys every Thursday for two years. They know this lawn better than I do.", name: "Greg W.", where: "Bridlewood, Flower Mound" },
    geo: { lat: 33.0146, lng: -97.0970 },
  },
];

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
