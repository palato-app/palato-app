import { theme } from '../../palate/palateTheme'
import type { SpeciesType } from '../data/originsData'

// Presentation helpers shared by the globe and the panels. No data here, just styling.

export const SPECIES_LABELS: Record<SpeciesType, string> = {
  arabica: 'Arabica',
  both: 'Arabica & Robusta',
  robusta: 'Robusta',
  liberica: 'Liberica',
  all_four: 'All four species',
}

// A warm brand-palette band per geographic section, used for the country hero tint.
const SECTION_TINTS: Record<string, string> = {
  'south america': 'rgba(47,74,56,0.16)',
  'mexico and central america': 'rgba(200,144,64,0.18)',
  caribbean: 'rgba(217,78,31,0.16)',
  'africa, east africa': 'rgba(217,78,31,0.18)',
  'africa, southern, west and central': 'rgba(200,144,64,0.20)',
  'arabian peninsula and south asia': 'rgba(200,144,64,0.16)',
  'east and southeast asia': 'rgba(47,74,56,0.18)',
  'oceania and the pacific': 'rgba(217,78,31,0.14)',
}

export function sectionTint(section: string): string {
  return SECTION_TINTS[section.toLowerCase()] ?? 'rgba(30,20,16,0.08)'
}

// Globe cap color by species: Arabica/both lean ember (the focus), robusta-leaning
// origins read ochre (secondary), so the Arabica story stays in front.
export function speciesCapColor(species: SpeciesType): string {
  if (species === 'arabica' || species === 'both') return theme.ember
  return 'rgba(200,144,64,0.82)' // ochre — robusta / liberica / secondary
}
