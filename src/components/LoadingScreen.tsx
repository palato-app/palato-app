import { useState, useEffect } from 'react'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const gold = '#C89B3C'

const phases = [
  { bg: ember, filter: 'brightness(0) invert(1) sepia(0.08) brightness(1.08)' },
  { bg: gold, filter: 'brightness(0) invert(1) sepia(0.08) brightness(1.08)' },
  { bg: espresso, filter: 'brightness(0) invert(1) sepia(0.08) brightness(1.08)' },
  { bg: cream, filter: 'none' },
] as const

const PHASE_MS = 600
const TOTAL_MS = phases.length * PHASE_MS

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

  const { bg, filter } = phases[phase]

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
      <img
        src="/palato-wordmark.png"
        alt="Palato"
        style={{
          width: 'clamp(180px, 50vw, 320px)',
          height: 'auto',
          filter,
          mixBlendMode: filter === 'none' ? 'multiply' : 'normal',
          transition: 'filter 0.35s ease',
        }}
      />
    </div>
  )
}
