import { useState, useEffect } from 'react'
import { PalatoWordmark } from './PalatoWordmark'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const gold = '#C89B3C'

// Constant cream canvas with the wordmark cycling brand colors. iOS locks its
// browser-bar tint at first paint and never re-tints mid-splash, so a cycling
// *background* left the bars stuck on the first phase's color; a fixed cream
// background matches the bars (and the app that follows) by construction.
const phases = [
  { bg: cream, fg: ember },
  { bg: cream, fg: gold },
  { bg: cream, fg: espresso },
  { bg: cream, fg: ember },
] as const

const PHASE_MS = 600

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (phase < phases.length - 1) {
      const t = setTimeout(() => setPhase(p => p + 1), PHASE_MS)
      return () => clearTimeout(t)
    }
    const fade = setTimeout(() => setFading(true), PHASE_MS)
    const done = setTimeout(onComplete, PHASE_MS + 400)
    return () => { clearTimeout(fade); clearTimeout(done) }
  }, [phase, onComplete])

  const { bg, fg } = phases[phase]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        transition: 'background-color 0.35s ease, opacity 0.4s ease',
        opacity: fading ? 0 : 1,
      }}
    >
      <PalatoWordmark
        color={fg}
        style={{
          width: 'clamp(180px, 50vw, 320px)',
          height: 'auto',
          transition: 'color 0.35s ease',
        }}
      />
    </div>
  )
}
