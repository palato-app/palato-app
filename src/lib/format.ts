// Shared display formatters. en-US locale only for now (TECH_DEBT, Journal).

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Bags print elevation as a single number or a range ("1,200–1,650 masl").
// Accepts any separator between two numbers (hyphen, en dash, "to").
export function parseElevationInput(raw: string): { min: number; max: number | null } | null {
  const nums = (raw.match(/\d[\d,]*/g) ?? [])
    .map((n) => parseInt(n.replace(/,/g, ''), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (nums.length === 0) return null
  const [a, b] = nums
  if (b === undefined || b === a) return { min: a, max: null }
  return { min: Math.min(a, b), max: Math.max(a, b) }
}

export function formatElevation(min: number | null, max?: number | null): string | null {
  if (min == null) return null
  const fmt = (n: number) => n.toLocaleString('en-US')
  return max != null && max !== min ? `${fmt(min)}–${fmt(max)} masl` : `${fmt(min)} masl`
}
