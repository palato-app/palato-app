// Editorial origin content for the Learn tab (§6). Static for v1.
// `country` matches coffees.origin_country so "See [Origin] coffees" can filter
// the catalog. `tint` is a brand-palette band color for the typographic hero
// (no stock photos / hand-drawn illustration yet — deferred to v1.1).

export type Origin = {
  slug: string
  name: string
  country: string
  tint: string
  tagline: string
  paragraphs: string[]
}

export const ORIGINS: Origin[] = [
  {
    slug: 'ethiopia',
    name: 'Ethiopia',
    country: 'Ethiopia',
    tint: 'rgba(217,78,31,0.16)',
    tagline: 'The birthplace of arabica.',
    paragraphs: [
      'Ethiopia is where arabica coffee began, growing wild in the forests of the southwest long before anyone thought to roast it. Coffee is woven into daily life here, and it still makes up roughly 30–35% of everything the country exports.',
      'Cups lean bright and aromatic — think jasmine, bergamot, stone fruit, and blueberry, especially from natural-processed lots. Washed coffees from regions like Yirgacheffe read cleaner and more floral; naturals from Guji and Sidama push into syrupy, fruit-forward territory.',
      'Most Ethiopian coffee is grown by smallholders and heirloom varieties no one has fully catalogued, often intercropped in garden plots. That genetic wealth is a big part of why the country tastes like nowhere else.',
    ],
  },
  {
    slug: 'colombia',
    name: 'Colombia',
    country: 'Colombia',
    tint: 'rgba(47,74,56,0.16)',
    tagline: 'Washed arabica, family-grown.',
    paragraphs: [
      'Colombia grows almost entirely washed arabica, tended by around 540,000 mostly small family farms spread across the Andes. The varied altitude and near-constant harvest mean fresh Colombian coffee is available somewhere in the country nearly year-round.',
      'The classic profile is balanced and approachable: caramel sweetness, red apple, citrus, and a rounded body. Higher-altitude lots from Nariño, Huila, and Tolima can show real brightness and clarity.',
      'A strong national federation and decades of investment in quality have made Colombia one of the most reliable origins in specialty — a great place to learn what "clean and sweet" tastes like.',
    ],
  },
  {
    slug: 'kenya',
    name: 'Kenya',
    country: 'Kenya',
    tint: 'rgba(200,144,64,0.18)',
    tagline: 'Bright, structured, unmistakable.',
    paragraphs: [
      'Most Kenyan coffee is sold through a single weekly auction and graded by bean size — the top grade is called AA. The system, combined with meticulous washed processing, has built a reputation for some of the most distinctive cups in the world.',
      'Expect intense, juicy acidity: blackcurrant, tomato, grapefruit, and a winey complexity that can be polarizing and addictive. The body is dense and the finish long.',
      'Much of the crop comes from smallholders delivering cherry to communal washing stations called factories, where careful sorting and double fermentation sharpen that signature brightness.',
    ],
  },
  {
    slug: 'guatemala',
    name: 'Guatemala',
    country: 'Guatemala',
    tint: 'rgba(47,74,56,0.20)',
    tagline: 'Eight regions, volcanic depth.',
    paragraphs: [
      "Guatemala's coffee board recognizes eight distinct growing regions. Among the most famous are Antigua, Atitlán, and Huehuetenango — each shaped by its own altitude, soil, and microclimate.",
      'Volcanic highland soil and big day-to-night temperature swings tend to produce coffees with cocoa and brown-sugar sweetness, gentle spice, and a soft, structured acidity. Antigua in particular is known for a chocolatey, full-bodied cup.',
      'Most farms are small to mid-sized and family-run, often shaded by trees and harvested by hand across steep slopes.',
    ],
  },
  {
    slug: 'brazil',
    name: 'Brazil',
    country: 'Brazil',
    tint: 'rgba(200,144,64,0.22)',
    tagline: 'The volume — and the comfort cup.',
    paragraphs: [
      'Brazil grows about a third of all the coffee on earth and has led the coffee world for over 150 years. Its scale shapes the global market, but it also produces plenty of distinctive specialty lots.',
      'The Brazilian signature is low acidity and heavy body: chocolate, peanut, caramel, and a smooth finish. Most coffee is natural or pulped-natural processed, which deepens that nutty sweetness — and makes Brazil the backbone of countless espresso blends.',
      "Much of it grows on flatter land at lower altitude than other origins, which allows mechanical harvesting at a scale that's rare in coffee.",
    ],
  },
  {
    slug: 'panama',
    name: 'Panama',
    country: 'Panama',
    tint: 'rgba(217,78,31,0.20)',
    tagline: 'Gesha country.',
    paragraphs: [
      'Panama is a small producer with an outsized reputation, thanks to one variety: Gesha. In 2025, a single washed Gesha sold at auction for $13,705 per pound — a new world record.',
      'Grown high on the slopes around Volcán Barú, the best Panamanian Geshas are famous for an almost tea-like delicacy: jasmine, bergamot, papaya, and honey, with a silky body that can feel more like a fine wine than a coffee.',
      "It's an origin to seek out when you want to taste the ceiling of what coffee can be — and to understand why provenance and variety command such a premium.",
    ],
  },
]

export function findOrigin(slug: string): Origin | undefined {
  return ORIGINS.find((o) => o.slug === slug)
}
