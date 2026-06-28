// Country -> ISO 3166-1 alpha-2, for sourcing flags (flagcdn.com) on the country page.
// Territories map to their sovereign flag (Hawaii/Puerto Rico -> US, Réunion -> FR).
// Grouped/multi-country secondary chips are intentionally omitted (no single flag).

const COUNTRY_ISO: Record<string, string> = {
  // South America
  Colombia: 'co', Brazil: 'br', Peru: 'pe', Bolivia: 'bo', Ecuador: 'ec', Venezuela: 've',
  Paraguay: 'py', 'French Guiana': 'gf', Suriname: 'sr', Guyana: 'gy',
  // Mexico & Central America
  Mexico: 'mx', Guatemala: 'gt', Honduras: 'hn', 'El Salvador': 'sv', Nicaragua: 'ni',
  'Costa Rica': 'cr', Panama: 'pa', Belize: 'bz',
  // Caribbean
  Jamaica: 'jm', 'Dominican Republic': 'do', Haiti: 'ht', Cuba: 'cu', 'Puerto Rico': 'pr',
  Martinique: 'mq',
  // Africa
  Ethiopia: 'et', Kenya: 'ke', Tanzania: 'tz', Rwanda: 'rw', Burundi: 'bi', Uganda: 'ug',
  'DR Congo': 'cd', Malawi: 'mw', Zambia: 'zm', Zimbabwe: 'zw', Mozambique: 'mz',
  'South Africa': 'za', Cameroon: 'cm', Madagascar: 'mg', Réunion: 're', Angola: 'ao',
  "Côte d'Ivoire": 'ci', Guinea: 'gn', Togo: 'tg', 'Sierra Leone': 'sl', Liberia: 'lr',
  Nigeria: 'ng', Ghana: 'gh', 'Central African Republic': 'cf',
  // Arabian Peninsula & South Asia
  Yemen: 'ye', 'Saudi Arabia': 'sa', India: 'in', 'Sri Lanka': 'lk', Nepal: 'np',
  // East & Southeast Asia
  Indonesia: 'id', Vietnam: 'vn', China: 'cn', Laos: 'la', Thailand: 'th', Myanmar: 'mm',
  Taiwan: 'tw', 'The Philippines': 'ph', 'Timor-Leste': 'tl', Cambodia: 'kh', Malaysia: 'my',
  // Oceania & the Pacific
  'Papua New Guinea': 'pg', Hawaii: 'us', Australia: 'au', Vanuatu: 'vu', 'New Caledonia': 'nc',
}

export function flagUrl(country: string): string | null {
  const iso = COUNTRY_ISO[country]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}
