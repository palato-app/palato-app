const BREW_METHOD_LABELS: Record<string, string> = {
  v60: 'V60',
  drip: 'Drip',
  aeropress: 'AeroPress',
  chemex: 'Chemex',
  kalita: 'Kalita',
  french_press: 'French Press',
  espresso: 'Espresso',
  moka_pot: 'Moka Pot',
  cold_brew: 'Cold Brew',
  siphon: 'Siphon',
  other: 'Other',
}

const GRIND_LABELS: Record<string, string> = {
  extra_fine: 'Extra fine',
  fine: 'Fine',
  medium_fine: 'Medium-fine',
  medium: 'Medium',
  medium_coarse: 'Medium-coarse',
  coarse: 'Coarse',
  extra_coarse: 'Extra coarse',
}

const EXTRACTION_LABELS: Record<string, string> = {
  under: 'Under-extracted',
  ideal: 'Balanced',
  over: 'Over-extracted',
}

function formatBrewTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${m}:00`
}

type BrewData = {
  brew_method: string | null
  dose_grams: number | null
  yield_grams: number | null
  brew_time_seconds: number | null
  grind_size: string | null
  water_temp_celsius: number | null
  extraction_quality: string | null
  body: number | null
  acidity: number | null
}

export function hasBrewDetails(data: BrewData): boolean {
  return !!(
    data.brew_method ||
    data.dose_grams ||
    data.yield_grams ||
    data.brew_time_seconds ||
    data.grind_size ||
    data.water_temp_celsius ||
    data.extraction_quality ||
    data.body != null ||
    data.acidity != null
  )
}

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '0.75rem 1.25rem',
    marginTop: '0.75rem',
  } as const,
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.6rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.45,
    margin: '0 0 0.15rem',
  } as const,
  value: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
    margin: 0,
  } as const,
}

type Props = {
  data: BrewData
}

export function BrewDetails({ data }: Props) {
  const items: { label: string; value: string }[] = []

  if (data.brew_method) {
    items.push({ label: 'Method', value: BREW_METHOD_LABELS[data.brew_method] ?? data.brew_method })
  }
  if (data.extraction_quality) {
    items.push({ label: 'Extraction', value: EXTRACTION_LABELS[data.extraction_quality] ?? data.extraction_quality })
  }
  if (data.dose_grams && data.yield_grams) {
    const ratio = Math.round(data.yield_grams / data.dose_grams)
    items.push({ label: 'Ratio', value: `1:${ratio} (${data.dose_grams}g → ${data.yield_grams}g)` })
  } else if (data.dose_grams) {
    items.push({ label: 'Dose', value: `${data.dose_grams}g` })
  } else if (data.yield_grams) {
    items.push({ label: 'Water', value: `${data.yield_grams}g` })
  }
  if (data.water_temp_celsius) {
    items.push({ label: 'Temp', value: `${data.water_temp_celsius}°C` })
  }
  if (data.brew_time_seconds) {
    items.push({ label: 'Time', value: formatBrewTime(data.brew_time_seconds) })
  }
  if (data.grind_size) {
    items.push({ label: 'Grind', value: GRIND_LABELS[data.grind_size] ?? data.grind_size })
  }
  if (data.body != null) {
    const bodyLabel = data.body < 0.33 ? 'Light' : data.body < 0.66 ? 'Medium' : 'Full'
    items.push({ label: 'Body', value: bodyLabel })
  }
  if (data.acidity != null) {
    const acidityLabel = data.acidity < 0.33 ? 'Low' : data.acidity < 0.66 ? 'Medium' : 'Bright'
    items.push({ label: 'Acidity', value: acidityLabel })
  }

  if (items.length === 0) return null

  return (
    <div style={s.grid}>
      {items.map((item) => (
        <div key={item.label}>
          <p style={s.label}>{item.label}</p>
          <p style={s.value}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
