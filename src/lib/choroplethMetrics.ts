export type MetricId =
  | 'partnerFarms'
  | 'organicShare'
  | 'exportVolume'
  | 'freshnessScore'
  | 'leadTimeDays';

export interface CountryRecord {
  iso: string;
  partnerFarms: number;
  organicShare: number;
  exportVolume: number;
  freshnessScore: number;
  leadTimeDays: number;
  yoyChange: number;
  specialty: string;
  note: string;
}

export interface MetricDefinition {
  id: MetricId;
  label: string;
  shortLabel: string;
  description: string;
  unit: string;
  invert: boolean;
  colors: string[];
  format: (value: number) => string;
}

export const METRICS: MetricDefinition[] = [
  {
    id: 'partnerFarms',
    label: 'Partner farms',
    shortLabel: 'Farms',
    description: 'Verified grower and dairy partners shipping into FreshMart hubs.',
    unit: 'farms',
    invert: false,
    colors: ['#d1fae5', '#6ee7b7', '#34d399', '#10b981', '#059669', '#064e3b'],
    format: v => `${Math.round(v).toLocaleString()} farms`,
  },
  {
    id: 'organicShare',
    label: 'Organic share',
    shortLabel: 'Organic',
    description: 'Share of inbound volume certified organic or pesticide-free.',
    unit: '%',
    invert: false,
    colors: ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#b45309', '#78350f'],
    format: v => `${v.toFixed(0)}% organic`,
  },
  {
    id: 'exportVolume',
    label: 'Inbound volume',
    shortLabel: 'Volume',
    description: 'Annual tonnes of produce, dairy, and staples sourced from the country.',
    unit: 't',
    invert: false,
    colors: ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1', '#4338ca', '#1e1b4b'],
    format: v => `${Math.round(v).toLocaleString()} t`,
  },
  {
    id: 'freshnessScore',
    label: 'Freshness score',
    shortLabel: 'Freshness',
    description: 'Composite score from cold-chain logs, QC rejects, and shelf-life on arrival.',
    unit: '/100',
    invert: false,
    colors: ['#ccfbf1', '#5eead4', '#2dd4bf', '#14b8a6', '#0f766e', '#134e4a'],
    format: v => `${v.toFixed(0)} / 100`,
  },
  {
    id: 'leadTimeDays',
    label: 'Avg. lead time',
    shortLabel: 'Lead time',
    description: 'Median days from harvest or pack to FreshMart DC receipt. Lower is better.',
    unit: 'days',
    invert: true,
    colors: ['#14532d', '#22c55e', '#facc15', '#fb923c', '#ef4444', '#9f1239'],
    format: v => `${v.toFixed(1)} days`,
  },
];

const NO_DATA = new Set(['ATA', 'ATF', 'FLK', 'ESH', 'CYN', 'SOL']);

interface Highlight {
  partnerFarms: number;
  organicShare: number;
  exportVolume: number;
  freshnessScore: number;
  leadTimeDays: number;
  yoyChange: number;
  specialty: string;
  note: string;
}

const HIGHLIGHTS: Record<string, Highlight> = {
  IND: {
    partnerFarms: 1842,
    organicShare: 64,
    exportVolume: 98400,
    freshnessScore: 89,
    leadTimeDays: 1.8,
    yoyChange: 12.4,
    specialty: 'Alphonso mangoes, spices, basmati, okra',
    note: 'Primary sourcing country for the Mumbai hub. Same-week air and rail lanes keep leafy greens and mangoes at peak flavor.',
  },
  USA: {
    partnerFarms: 410,
    organicShare: 71,
    exportVolume: 22100,
    freshnessScore: 86,
    leadTimeDays: 6.4,
    yoyChange: 3.1,
    specialty: 'Almonds, berries, specialty cheese',
    note: 'West-coast organic cooperatives supply off-season berries and nuts into metro cold stores.',
  },
  BRA: {
    partnerFarms: 620,
    organicShare: 48,
    exportVolume: 41200,
    freshnessScore: 82,
    leadTimeDays: 8.2,
    yoyChange: 7.6,
    specialty: 'Coffee, oranges, bananas, sugar',
    note: 'Long-standing citrus and banana contracts with traceable farm lots and MSC-certified packing.',
  },
  KEN: {
    partnerFarms: 290,
    organicShare: 81,
    exportVolume: 8600,
    freshnessScore: 93,
    leadTimeDays: 2.4,
    yoyChange: 18.2,
    specialty: 'French beans, avocados, tea, roses',
    note: 'Nairobi overnight air freight is one of the highest-scoring cold chains in the network.',
  },
  NLD: {
    partnerFarms: 88,
    organicShare: 76,
    exportVolume: 15400,
    freshnessScore: 95,
    leadTimeDays: 3.1,
    yoyChange: 4.4,
    specialty: 'Greenhouse tomatoes, peppers, cheese',
    note: 'Dutch glasshouse partners deliver year-round consistency with near-zero QC rejects.',
  },
  ESP: {
    partnerFarms: 214,
    organicShare: 69,
    exportVolume: 19800,
    freshnessScore: 90,
    leadTimeDays: 4.2,
    yoyChange: 5.8,
    specialty: 'Citrus, olive oil, berries, garlic',
    note: 'Almería and Valencia lanes cover winter citrus when Indian mandarins are off-season.',
  },
  CHN: {
    partnerFarms: 505,
    organicShare: 41,
    exportVolume: 33600,
    freshnessScore: 78,
    leadTimeDays: 9.5,
    yoyChange: -1.2,
    specialty: 'Garlic, ginger, apples, tea',
    note: 'Volume-heavy staple program with tightened residue testing on every inbound container.',
  },
  MEX: {
    partnerFarms: 176,
    organicShare: 58,
    exportVolume: 14200,
    freshnessScore: 84,
    leadTimeDays: 7.1,
    yoyChange: 6.0,
    specialty: 'Avocados, limes, chili, berries',
    note: 'Hass avocado lots are lot-coded to orchard blocks for farm-to-kitchen traceability.',
  },
  AUS: {
    partnerFarms: 96,
    organicShare: 73,
    exportVolume: 6100,
    freshnessScore: 88,
    leadTimeDays: 11.2,
    yoyChange: 2.2,
    specialty: 'Macadamias, beef, honey, wine grapes',
    note: 'Counter-seasonal fruit fills summer gaps in the northern hemisphere catalog.',
  },
  GBR: {
    partnerFarms: 64,
    organicShare: 80,
    exportVolume: 4200,
    freshnessScore: 91,
    leadTimeDays: 5.6,
    yoyChange: 1.4,
    specialty: 'Cheddar, berries, oats, cider apples',
    note: 'Small-lot artisan dairy and bakery ingredients for the premium aisle.',
  },
  FRA: {
    partnerFarms: 112,
    organicShare: 77,
    exportVolume: 7800,
    freshnessScore: 92,
    leadTimeDays: 5.1,
    yoyChange: 3.3,
    specialty: 'Cheese, stone fruit, mustard, wine vinegar',
    note: 'AOC dairy partners supply the specialty cheese counter.',
  },
  ITA: {
    partnerFarms: 140,
    organicShare: 74,
    exportVolume: 9100,
    freshnessScore: 90,
    leadTimeDays: 5.4,
    yoyChange: 4.1,
    specialty: 'Olive oil, tomatoes, pasta wheat, citrus',
    note: 'Cold-pressed oils and San Marzano-style tomatoes are flagship SKUs.',
  },
  VNM: {
    partnerFarms: 248,
    organicShare: 52,
    exportVolume: 18700,
    freshnessScore: 81,
    leadTimeDays: 6.8,
    yoyChange: 9.7,
    specialty: 'Dragon fruit, coffee, cashews, pepper',
    note: 'Mekong fruit program expanded after a successful 2025 pilot in Bengaluru.',
  },
  THA: {
    partnerFarms: 188,
    organicShare: 55,
    exportVolume: 12300,
    freshnessScore: 83,
    leadTimeDays: 5.9,
    yoyChange: 8.1,
    specialty: 'Rice, coconut, mango, herbs',
    note: 'Jasmine rice and young coconut water are high-velocity pantry items.',
  },
  COL: {
    partnerFarms: 132,
    organicShare: 66,
    exportVolume: 9800,
    freshnessScore: 87,
    leadTimeDays: 8.6,
    yoyChange: 11.0,
    specialty: 'Coffee, bananas, panela, avocados',
    note: 'Direct-trade coffee lots include farmer premiums published on each bag.',
  },
  ETH: {
    partnerFarms: 210,
    organicShare: 70,
    exportVolume: 5400,
    freshnessScore: 85,
    leadTimeDays: 7.4,
    yoyChange: 14.8,
    specialty: 'Coffee, honey, teff, spices',
    note: 'Highland cooperatives are a growing specialty-coffee source.',
  },
  NZL: {
    partnerFarms: 42,
    organicShare: 82,
    exportVolume: 3100,
    freshnessScore: 94,
    leadTimeDays: 12.8,
    yoyChange: 2.9,
    specialty: 'Kiwi fruit, lamb, honey, apples',
    note: 'Counter-seasonal kiwifruit arrives with exceptional firmness scores.',
  },
  JPN: {
    partnerFarms: 38,
    organicShare: 68,
    exportVolume: 1800,
    freshnessScore: 96,
    leadTimeDays: 6.2,
    yoyChange: 1.1,
    specialty: 'Matcha, citrus, rice, premium fruit',
    note: 'Small luxury fruit lots for gifting and the premium produce bay.',
  },
  DEU: {
    partnerFarms: 71,
    organicShare: 79,
    exportVolume: 5600,
    freshnessScore: 91,
    leadTimeDays: 5.8,
    yoyChange: 2.0,
    specialty: 'Rye, dairy, mustard, apples',
    note: 'Organic rye and cultured dairy support the bakery and breakfast sets.',
  },
  EGY: {
    partnerFarms: 156,
    organicShare: 44,
    exportVolume: 16700,
    freshnessScore: 80,
    leadTimeDays: 4.6,
    yoyChange: 6.5,
    specialty: 'Oranges, dates, herbs, onions',
    note: 'Winter orange program keeps juice bars stocked between Indian citrus peaks.',
  },
  ZAF: {
    partnerFarms: 118,
    organicShare: 61,
    exportVolume: 8900,
    freshnessScore: 86,
    leadTimeDays: 10.4,
    yoyChange: 5.2,
    specialty: 'Citrus, grapes, avocados, wine',
    note: 'Cape citrus bridges the northern winter with strong peel-quality scores.',
  },
  PER: {
    partnerFarms: 94,
    organicShare: 72,
    exportVolume: 7200,
    freshnessScore: 88,
    leadTimeDays: 9.1,
    yoyChange: 10.3,
    specialty: 'Quinoa, blueberries, asparagus, coffee',
    note: 'Andean quinoa and blueberries are certified fair-trade lots.',
  },
  CAN: {
    partnerFarms: 54,
    organicShare: 75,
    exportVolume: 3900,
    freshnessScore: 87,
    leadTimeDays: 8.8,
    yoyChange: 1.8,
    specialty: 'Maple, lentils, mustard seed, berries',
    note: 'Prairie pulses fill the organic staples aisle year-round.',
  },
  IDN: {
    partnerFarms: 320,
    organicShare: 47,
    exportVolume: 21400,
    freshnessScore: 79,
    leadTimeDays: 7.7,
    yoyChange: 8.9,
    specialty: 'Spices, coconut, coffee, palm sugar',
    note: 'Spice islands lots are the backbone of the masala program.',
  },
  LKA: {
    partnerFarms: 86,
    organicShare: 63,
    exportVolume: 4100,
    freshnessScore: 84,
    leadTimeDays: 3.4,
    yoyChange: 7.2,
    specialty: 'Ceylon tea, cinnamon, coconut, spices',
    note: 'Short sea hop to Indian ports keeps tea and cinnamon exceptionally fresh.',
  },
  NPL: {
    partnerFarms: 67,
    organicShare: 78,
    exportVolume: 1200,
    freshnessScore: 90,
    leadTimeDays: 3.8,
    yoyChange: 15.6,
    specialty: 'Honey, cardamom, apples, tea',
    note: 'Hill-farm honey and large cardamom are customer favorites in the organic set.',
  },
  BGD: {
    partnerFarms: 198,
    organicShare: 39,
    exportVolume: 6400,
    freshnessScore: 77,
    leadTimeDays: 2.9,
    yoyChange: 9.4,
    specialty: 'Hilsa, jute greens, tea, rice',
    note: 'Regional greens and rice mill partners supply East-India dark stores.',
  },
  PAK: {
    partnerFarms: 142,
    organicShare: 36,
    exportVolume: 5100,
    freshnessScore: 76,
    leadTimeDays: 4.1,
    yoyChange: 4.7,
    specialty: 'Kinnow, basmati, mango, spices',
    note: 'Kinnow citrus and basmati lots complement the Indian grain program.',
  },
  MAR: {
    partnerFarms: 73,
    organicShare: 59,
    exportVolume: 4300,
    freshnessScore: 85,
    leadTimeDays: 6.7,
    yoyChange: 6.8,
    specialty: 'Argan, citrus, olives, mint',
    note: 'Argan and mint are high-margin specialty SKUs with strong repeat rates.',
  },
  TUR: {
    partnerFarms: 101,
    organicShare: 57,
    exportVolume: 6800,
    freshnessScore: 83,
    leadTimeDays: 6.1,
    yoyChange: 3.9,
    specialty: 'Hazelnuts, figs, olives, apricots',
    note: 'Dried fruit and nut program for trail mixes and bakery inclusions.',
  },
  GHA: {
    partnerFarms: 124,
    organicShare: 68,
    exportVolume: 3900,
    freshnessScore: 82,
    leadTimeDays: 8.4,
    yoyChange: 12.1,
    specialty: 'Cocoa, pineapple, plantain, spices',
    note: 'Direct cocoa and pineapple contracts with cooperative premiums.',
  },
  CRI: {
    partnerFarms: 48,
    organicShare: 84,
    exportVolume: 2700,
    freshnessScore: 92,
    leadTimeDays: 8.9,
    yoyChange: 5.5,
    specialty: 'Bananas, coffee, pineapple, cacao',
    note: 'Near-100% rainforest-alliance banana pallets.',
  },
  CHL: {
    partnerFarms: 61,
    organicShare: 70,
    exportVolume: 5400,
    freshnessScore: 89,
    leadTimeDays: 13.2,
    yoyChange: 2.6,
    specialty: 'Grapes, berries, wine, salmon',
    note: 'Counter-seasonal table grapes keep the fruit bay full in July.',
  },
  ARG: {
    partnerFarms: 77,
    organicShare: 54,
    exportVolume: 4800,
    freshnessScore: 81,
    leadTimeDays: 14.1,
    yoyChange: 1.9,
    specialty: 'Beef, lemon, wine, honey',
    note: 'Patagonian honey and citrus oils for the specialty grocery set.',
  },
  RUS: {
    partnerFarms: 22,
    organicShare: 28,
    exportVolume: 900,
    freshnessScore: 71,
    leadTimeDays: 16.4,
    yoyChange: -8.5,
    specialty: 'Honey, buckwheat, sunflower oil',
    note: 'Limited staple contracts; volume has been tapering by design.',
  },
  UKR: {
    partnerFarms: 39,
    organicShare: 49,
    exportVolume: 2100,
    freshnessScore: 74,
    leadTimeDays: 12.6,
    yoyChange: -3.4,
    specialty: 'Sunflower oil, honey, wheat, berries',
    note: 'Humanitarian-aligned grain and oil lots with extra origin checks.',
  },
  ISR: {
    partnerFarms: 29,
    organicShare: 71,
    exportVolume: 1600,
    freshnessScore: 90,
    leadTimeDays: 5.2,
    yoyChange: 0.8,
    specialty: 'Dates, citrus, herbs, tahini',
    note: 'Medjool dates and greenhouse herbs for the deli counter.',
  },
  ARE: {
    partnerFarms: 18,
    organicShare: 42,
    exportVolume: 1100,
    freshnessScore: 88,
    leadTimeDays: 3.2,
    yoyChange: 16.4,
    specialty: 'Dates, re-export spices, greenhouse greens',
    note: 'Dubai re-export hub also consolidates East-Africa air freight.',
  },
  SGP: {
    partnerFarms: 4,
    organicShare: 35,
    exportVolume: 200,
    freshnessScore: 90,
    leadTimeDays: 4.8,
    yoyChange: 2.0,
    specialty: 'Specialty sauces, re-export pantry',
    note: 'Mostly a transshipment node rather than a grower origin.',
  },
};

const SPECIALTIES = [
  'Seasonal fruit',
  'Leafy greens',
  'Grains & pulses',
  'Dairy & cheese',
  'Spices & herbs',
  'Tree nuts',
  'Coffee & cacao',
  'Citrus',
  'Root vegetables',
  'Honey & sweeteners',
];

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed: number): number {
  return ((seed % 10000) + 1) / 10000;
}

function range(seed: number, min: number, max: number): number {
  return min + unit(seed) * (max - min);
}

export function buildCountryRecord(iso: string, continent?: string): CountryRecord | null {
  if (NO_DATA.has(iso)) return null;
  const highlight = HIGHLIGHTS[iso];
  if (highlight) {
    return { iso, ...highlight };
  }

  const continentBoost =
    continent === 'Asia' || continent === 'Africa' || continent === 'South America' ? 1.15 : 0.75;

  const s1 = hashString(`${iso}-farms`);
  const s2 = hashString(`${iso}-org`);
  const s3 = hashString(`${iso}-vol`);
  const s4 = hashString(`${iso}-fresh`);
  const s5 = hashString(`${iso}-lead`);
  const s6 = hashString(`${iso}-yoy`);
  const s7 = hashString(`${iso}-spec`);

  return {
    iso,
    partnerFarms: Math.round(range(s1, 6, 160) * continentBoost),
    organicShare: Math.round(range(s2, 22, 82)),
    exportVolume: Math.round(range(s3, 180, 5200) * continentBoost),
    freshnessScore: Math.round(range(s4, 62, 93)),
    leadTimeDays: Number(range(s5, 3.2, 18.5).toFixed(1)),
    yoyChange: Number(range(s6, -6, 14).toFixed(1)),
    specialty: SPECIALTIES[s7 % SPECIALTIES.length],
    note: 'Sample sourcing snapshot used to color the map. Figures are illustrative, not live procurement data.',
  };
}

export function getMetricValue(record: CountryRecord, metric: MetricId): number {
  return record[metric];
}

export function quantileIndex(value: number, sorted: number[], bins: number): number {
  if (sorted.length === 0) return 0;
  const rank = sorted.findIndex(v => v >= value);
  const position = rank === -1 ? sorted.length - 1 : rank;
  const t = position / Math.max(sorted.length - 1, 1);
  return Math.min(bins - 1, Math.floor(t * bins));
}

export function colorForValue(
  value: number | null,
  sorted: number[],
  colors: string[],
  invert: boolean
): string {
  if (value == null || sorted.length === 0) return '#e2e8f0';
  let idx = quantileIndex(value, sorted, colors.length);
  if (invert) idx = colors.length - 1 - idx;
  return colors[idx];
}

export function legendStops(sorted: number[], colors: string[], invert: boolean, format: (v: number) => string) {
  if (sorted.length === 0) return [];
  const bins = colors.length;
  return colors.map((color, i) => {
    const fromIdx = Math.floor((i / bins) * (sorted.length - 1));
    const toIdx = Math.floor(((i + 1) / bins) * (sorted.length - 1));
    const lo = invert ? sorted[sorted.length - 1 - toIdx] : sorted[fromIdx];
    const hi = invert ? sorted[sorted.length - 1 - fromIdx] : sorted[toIdx];
    return {
      color,
      label: i === bins - 1 ? format(hi) : format(lo),
    };
  });
}

export function rankForMetric(records: CountryRecord[], iso: string, metric: MetricId): number {
  const sorted = [...records].sort((a, b) => {
    const av = getMetricValue(a, metric);
    const bv = getMetricValue(b, metric);
    const metricDef = METRICS.find(m => m.id === metric);
    return metricDef?.invert ? av - bv : bv - av;
  });
  return sorted.findIndex(r => r.iso === iso) + 1;
}
