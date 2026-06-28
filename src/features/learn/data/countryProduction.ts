// Annual coffee production + world rank for the "By the Numbers" block.
// Source: USDA FAS "Coffee: World Markets and Trade" / ICO, 2024/25 crop year,
// in thousand 60-kg bags (world ≈175.3M bags; Brazil ≈37%). This is a SEED to verify
// against the primary USDA/ICO tables before launch — figures and tail ranks shift
// year to year. Only the top ~20 producers are included (ranks below that are noisy and
// the volumes tiny); everyone else simply shows no production row.
//
// Keys must match the parsed display country name exactly.

export type ProductionStat = {
  rank: number
  thousandBags: number // thousand 60-kg bags, 2024/25
}

export const COUNTRY_PRODUCTION: Record<string, ProductionStat> = {
  Brazil: { rank: 1, thousandBags: 65000 },
  Vietnam: { rank: 2, thousandBags: 29000 },
  Colombia: { rank: 3, thousandBags: 14800 },
  Ethiopia: { rank: 4, thousandBags: 11130 },
  Indonesia: { rank: 5, thousandBags: 10650 },
  Uganda: { rank: 6, thousandBags: 6700 },
  India: { rank: 7, thousandBags: 6200 },
  Honduras: { rank: 8, thousandBags: 5000 },
  Mexico: { rank: 9, thousandBags: 3870 },
  Peru: { rank: 10, thousandBags: 3700 },
  Guatemala: { rank: 11, thousandBags: 3200 },
  Nicaragua: { rank: 12, thousandBags: 2560 },
  China: { rank: 13, thousandBags: 1900 },
  Malaysia: { rank: 14, thousandBags: 1400 },
  Tanzania: { rank: 15, thousandBags: 1350 },
  'Costa Rica': { rank: 16, thousandBags: 1300 },
  Kenya: { rank: 17, thousandBags: 1000 },
  Thailand: { rank: 18, thousandBags: 900 },
  'Papua New Guinea': { rank: 19, thousandBags: 840 },
  "Côte d'Ivoire": { rank: 20, thousandBags: 650 },
}

export function productionFor(country: string): ProductionStat | undefined {
  return COUNTRY_PRODUCTION[country]
}

/** Friendly production string, e.g. "≈65M 60-kg bags (2024/25)". */
export function productionLabel(stat: ProductionStat): string {
  const millions = stat.thousandBags / 1000
  const val = millions >= 10 ? Math.round(millions).toString() : millions.toFixed(1).replace(/\.0$/, '')
  return `≈${val}M 60-kg bags (2024/25)`
}
