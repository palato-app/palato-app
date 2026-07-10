import { useState, useEffect } from 'react'
import { PalatoWordmark } from './PalatoWordmark'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'
const gold = '#C89B3C'

const phases = [
  { bg: ember, fg: cream },
  { bg: gold, fg: cream },
  { bg: espresso, fg: cream },
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

  // iOS Safari honors only the FIRST dynamic theme-color write and ignores
  // rapid follow-ups (it latched phase-0 ember and kept it all session). So:
  // remove the meta while the splash runs — with no theme-color, iOS samples
  // the page background for its bars — and restore the cream meta after.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) document.head.removeChild(meta)
    return () => {
      if (meta) document.head.appendChild(meta)
    }
  }, [])

  // Paint <html> itself each phase so the sampled bar regions (status bar,
  // around the address pill, overscroll) always show the splash color.
  useEffect(() => {
    document.documentElement.style.backgroundColor = bg
    return () => {
      document.documentElement.style.backgroundColor = ''
    }
  }, [bg])

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
