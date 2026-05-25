import { useId } from 'react'

type Props = {
  value: number | null
  onChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  gradientColors?: [string, string]
}

export function GradientSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  gradientColors = ['#C89040', '#D94E1F'],
}: Props) {
  const id = useId()
  const displayValue = value ?? 0.5

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', height: '36px', marginBottom: '0.35rem' }}>
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '6px',
            transform: 'translateY(-50%)',
            borderRadius: '3px',
            background: value !== null
              ? `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`
              : 'rgba(30, 20, 16, 0.12)',
            transition: 'background 0.2s',
          }}
        />
        {/* Native range input, styled transparent */}
        <input
          id={id}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={displayValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            opacity: 0,
            cursor: 'pointer',
            zIndex: 1,
          }}
        />
        {/* Custom thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${displayValue * 100}%`,
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: value !== null ? '#D94E1F' : 'rgba(30, 20, 16, 0.2)',
            border: '3px solid #F4EAD5',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(30, 20, 16, 0.2)',
            transition: 'background 0.15s',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Geist, system-ui, sans-serif',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#1E1410',
          opacity: 0.45,
        }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
