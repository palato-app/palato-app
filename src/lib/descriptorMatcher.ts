import type { FlavorDescriptor } from './useFlavorDescriptors'

export type DescriptorMatch = {
  descriptor: FlavorDescriptor
  startIndex: number
  endIndex: number
  matchedText: string
}

export function buildDescriptorLookup(
  descriptors: FlavorDescriptor[]
): Map<string, FlavorDescriptor> {
  const map = new Map<string, FlavorDescriptor>()
  for (const d of descriptors) {
    const key = d.descriptor.toLowerCase()
    if (!map.has(key)) map.set(key, d)
    if (d.aliases) {
      for (const alias of d.aliases) {
        const aliasKey = alias.toLowerCase()
        if (!map.has(aliasKey)) map.set(aliasKey, d)
      }
    }
  }
  return map
}

const PUNCTUATION = /[.,!?;:'"()[\]{}\-—–]/g

export function findMatches(
  text: string,
  lookup: Map<string, FlavorDescriptor>
): DescriptorMatch[] {
  if (!text.trim()) return []

  const matches: DescriptorMatch[] = []
  const seenDescriptorIds = new Set<string>()
  const words = text.split(/\s+/)

  const wordPositions: { word: string; start: number; end: number }[] = []
  let searchFrom = 0
  for (const word of words) {
    const idx = text.indexOf(word, searchFrom)
    wordPositions.push({ word, start: idx, end: idx + word.length })
    searchFrom = idx + word.length
  }

  // Sliding window: try 3-word, 2-word, 1-word phrases
  const consumed = new Set<number>()
  for (let windowSize = 3; windowSize >= 1; windowSize--) {
    for (let i = 0; i <= wordPositions.length - windowSize; i++) {
      if (consumed.has(i)) continue

      const phrase = wordPositions
        .slice(i, i + windowSize)
        .map((w) => w.word)
        .join(' ')
      const cleaned = phrase.replace(PUNCTUATION, '').toLowerCase()
      if (!cleaned) continue

      const descriptor = lookup.get(cleaned)
      if (descriptor && !seenDescriptorIds.has(descriptor.id)) {
        seenDescriptorIds.add(descriptor.id)
        const start = wordPositions[i].start
        const end = wordPositions[i + windowSize - 1].end
        matches.push({
          descriptor,
          startIndex: start,
          endIndex: end,
          matchedText: text.slice(start, end),
        })
        for (let j = i; j < i + windowSize; j++) consumed.add(j)
      }
    }
  }

  return matches.sort((a, b) => a.startIndex - b.startIndex)
}
