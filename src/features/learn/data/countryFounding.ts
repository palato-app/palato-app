// "Coffee since {year}" for the By the Numbers block. Each value is grounded in the
// introduction date stated in our verified markdown (palato-coffee-origins-verified.md)
// or in well-established coffee history — a curated field, not parsed (prose mentions
// stray years, e.g. an auction record, that aren't the founding date). Verify before
// launch. Countries without a confident date simply show no row.
//
// Keys must match the parsed display country name exactly.

const COUNTRY_FOUNDING: Record<string, string> = {
  Yemen: 'the 1400s',
  India: 'around 1670',
  Réunion: 'the early 1700s',
  Indonesia: 'around 1711',
  Suriname: '1718',
  Martinique: '1720',
  Brazil: '1727',
  Jamaica: '1728',
  'The Philippines': '1740',
  Vietnam: '1857',
  Angola: '1790',
  Myanmar: '1885',
  'Papua New Guinea': 'the 1890s',
  China: '1892',
  Taiwan: 'around 1902',
  Laos: 'around 1915',
  Vanuatu: '1852',
}

export function foundingFor(country: string): string | undefined {
  return COUNTRY_FOUNDING[country]
}
