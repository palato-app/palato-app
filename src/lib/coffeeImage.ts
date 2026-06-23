// Deterministic placeholder for coffees with no bag photo: the animated
// "Imagine a nice coffee bag" tile on one of four non-white backgrounds
// (cream / orange / dark / color — white is deliberately excluded). Stable per
// coffee id so a given coffee always gets the same background.

const ART = ['/placeholders/imagine-coffee-bag.webp']
const BACKGROUNDS = [
  '#EFE7D6', // cream
  '#E8521F', // orange
  '#241F1A', // dark
  'linear-gradient(135deg, #6B8E6B, #3A5A3A)', // color
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function coffeePlaceholder(coffeeId: string): { art: string; background: string } {
  const h = hash(coffeeId || 'palato')
  return {
    art: ART[h % ART.length],
    background: BACKGROUNDS[Math.floor(h / ART.length) % BACKGROUNDS.length],
  }
}
