// Main (and where notable, secondary/fly) coffee harvest window per country, as month
// ranges, to drive the harvest-cycle calendar in By the Numbers. Verified against
// published harvest calendars (Mercanta / Coffee Hunter, importer calendars), June 2026.
// Months are 1-12 inclusive and wrap across the year-end (e.g. {10,1} = Oct,Nov,Dec,Jan).
// A representative window — regional crops vary; verify edge cases before launch.
//
// Keys must match the parsed display country name exactly.

export type MonthRange = { start: number; end: number }
export type HarvestData = { main: MonthRange; secondary?: MonthRange }

const COUNTRY_HARVEST: Record<string, HarvestData> = {
  Brazil: { main: { start: 5, end: 9 } },
  Vietnam: { main: { start: 10, end: 1 }, secondary: { start: 5, end: 9 } },
  Colombia: { main: { start: 9, end: 1 }, secondary: { start: 4, end: 6 } },
  Ethiopia: { main: { start: 10, end: 1 } },
  Indonesia: { main: { start: 5, end: 9 } },
  Uganda: { main: { start: 10, end: 2 }, secondary: { start: 4, end: 8 } },
  India: { main: { start: 11, end: 2 } },
  Honduras: { main: { start: 11, end: 3 } },
  Mexico: { main: { start: 11, end: 3 } },
  Peru: { main: { start: 5, end: 9 } },
  Guatemala: { main: { start: 11, end: 4 } },
  Nicaragua: { main: { start: 11, end: 3 } },
  'Costa Rica': { main: { start: 11, end: 3 } },
  'El Salvador': { main: { start: 11, end: 3 } },
  Panama: { main: { start: 11, end: 3 } },
  Kenya: { main: { start: 10, end: 1 }, secondary: { start: 5, end: 7 } },
  Tanzania: { main: { start: 7, end: 12 } },
  Rwanda: { main: { start: 4, end: 7 } },
  Burundi: { main: { start: 3, end: 7 } },
  Yemen: { main: { start: 10, end: 2 } },
  Bolivia: { main: { start: 5, end: 9 } },
  Ecuador: { main: { start: 5, end: 9 } },
  'Papua New Guinea': { main: { start: 6, end: 9 }, secondary: { start: 1, end: 3 } },
  Jamaica: { main: { start: 9, end: 12 } },
  China: { main: { start: 10, end: 12 } },
  Thailand: { main: { start: 11, end: 2 } },
  Laos: { main: { start: 11, end: 2 } },
}

export function harvestFor(country: string): HarvestData | undefined {
  return COUNTRY_HARVEST[country]
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Months (1-12) covered by a range, wrapping across the year-end. */
export function monthsInRange({ start, end }: MonthRange): number[] {
  const out: number[] = []
  let m = start
  // Guard against a malformed range looping forever.
  for (let i = 0; i < 12; i++) {
    out.push(m)
    if (m === end) break
    m = (m % 12) + 1
  }
  return out
}

/** "May-Sep" style label (hyphen per house style). */
export function rangeLabel({ start, end }: MonthRange): string {
  return `${MONTH_ABBR[start - 1]}-${MONTH_ABBR[end - 1]}`
}
