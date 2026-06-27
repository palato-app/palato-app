// Main coffee harvest window per country, for the By the Numbers block. Curated from
// published harvest calendars (Mercanta, Green Plantation, importer calendars) — a
// representative main-crop window; many origins have regional or secondary (fly) crops
// that vary. Hyphens (not en-dashes) per house style. Seed to verify before launch;
// countries without a confident window show no row.
//
// Keys must match the parsed display country name exactly.

const COUNTRY_HARVEST: Record<string, string> = {
  Brazil: 'May-Sep',
  Vietnam: 'Oct-Jan',
  Colombia: 'Year-round (main Sep-Dec)',
  Ethiopia: 'Oct-Jan',
  Indonesia: 'May-Sep',
  Uganda: 'Oct-Feb',
  India: 'Nov-Mar',
  Honduras: 'Nov-Mar',
  Mexico: 'Nov-Mar',
  Peru: 'Apr-Sep',
  Guatemala: 'Nov-Mar',
  Nicaragua: 'Nov-Mar',
  'Costa Rica': 'Nov-Mar',
  'El Salvador': 'Nov-Mar',
  Panama: 'Dec-Mar',
  Kenya: 'Oct-Dec',
  Tanzania: 'Jul-Dec',
  Rwanda: 'Mar-Jun',
  Burundi: 'Mar-Jun',
  Yemen: 'Oct-Dec',
  Bolivia: 'Jul-Nov',
  'Papua New Guinea': 'Apr-Sep',
  Jamaica: 'Sep-Feb',
}

export function harvestFor(country: string): string | undefined {
  return COUNTRY_HARVEST[country]
}
