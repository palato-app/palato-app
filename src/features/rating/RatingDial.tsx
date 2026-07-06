import { useRef, useState } from 'react'

type Props = {
  value: number | null
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

// Geometry — dial is a 270° arc, bottom-left (min) → top → bottom-right (max)
const SIZE = 320
const CENTER = SIZE / 2
const RADIUS = 110
const STROKE_WIDTH = 10
const ARC_START_DEG = -135
const ARC_END_DEG = 135
const ARC_SWEEP_DEG = ARC_END_DEG - ARC_START_DEG // 270

function polarToCartesian(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.sin(angleRad),
    y: CENTER - radius * Math.cos(angleRad),
  }
}

function describeArc(startDeg: number, endDeg: number, radius: number) {
  const start = polarToCartesian(endDeg, radius)
  const end = polarToCartesian(startDeg, radius)
  const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
}

function valueToAngle(value: number, min: number, max: number) {
  const progress = (value - min) / (max - min)
  return ARC_START_DEG + progress * ARC_SWEEP_DEG
}

function angleToValue(angleDeg: number, min: number, max: number, step: number) {
  let normalized = angleDeg
  while (normalized > 180) normalized -= 360
  while (normalized < -180) normalized += 360
  if (normalized < ARC_START_DEG) normalized = ARC_START_DEG
  if (normalized > ARC_END_DEG) normalized = ARC_END_DEG
  const progress = (normalized - ARC_START_DEG) / ARC_SWEEP_DEG
  const rawValue = min + progress * (max - min)
  const steps = Math.round((rawValue - min) / step)
  return Math.max(min, Math.min(max, min + steps * step))
}

export function RatingDial({ value, onChange, min = 1.0, max = 5.0, step = 0.1 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayValue = value ?? (min + max) / 2
  const handleAngle = valueToAngle(displayValue, min, max)
  const handlePos = polarToCartesian(handleAngle, RADIUS)

  const backgroundArc = describeArc(ARC_START_DEG, ARC_END_DEG, RADIUS)
  const foregroundArc = describeArc(ARC_START_DEG, handleAngle, RADIUS)

  const commitValue = (next: number) => {
    if (next === value) return
    // Soft tick per step on devices that support it (Web Vibration API)
    if ('vibrate' in navigator) navigator.vibrate(10)
    onChange(next)
  }

  const getAngleFromPointer = (clientX: number, clientY: number) => {
    if (!svgRef.current) return 0
    const rect = svgRef.current.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    return (Math.atan2(dx, -dy) * 180) / Math.PI
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    commitValue(angleToValue(getAngleFromPointer(e.clientX, e.clientY), min, max, step))
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    commitValue(angleToValue(getAngleFromPointer(e.clientX, e.clientY), min, max, step))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // An unset dial starts stepping from the midpoint the handle already rests on
    const currentStepIndex = Math.round((displayValue - min) / step)
    const totalSteps = Math.round((max - min) / step)
    let nextStepIndex: number
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextStepIndex = currentStepIndex + 1
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        nextStepIndex = currentStepIndex - 1
        break
      case 'PageUp':
        nextStepIndex = currentStepIndex + Math.round(1 / step)
        break
      case 'PageDown':
        nextStepIndex = currentStepIndex - Math.round(1 / step)
        break
      case 'Home':
        nextStepIndex = 0
        break
      case 'End':
        nextStepIndex = totalSteps
        break
      default:
        return
    }
    e.preventDefault()
    nextStepIndex = Math.max(0, Math.min(totalSteps, nextStepIndex))
    commitValue(Number((min + nextStepIndex * step).toFixed(2)))
  }

  // Tick generation — integers get labels, half-steps are decorative
  const majorTicks: number[] = []
  for (let v = min; v <= max + 0.001; v += 1) majorTicks.push(v)

  const minorTicks: number[] = []
  for (let v = min + 0.5; v < max; v += 1) minorTicks.push(v)

  return (
    <div
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        margin: '0 auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="palato-rating-dial"
        role="slider"
        tabIndex={0}
        aria-label="Coffee rating"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={displayValue}
        aria-valuetext={value !== null ? `${value.toFixed(1)} out of ${max}` : 'Not rated yet'}
        onKeyDown={handleKeyDown}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <defs>
          <linearGradient id="dialGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C89040" />
            <stop offset="60%" stopColor="#D94E1F" />
            <stop offset="100%" stopColor="#D94E1F" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="rgba(30, 20, 16, 0.12)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {value !== null && (
          <path
            d={foregroundArc}
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        )}

        {/* Minor (half-step) ticks — short, no labels, subordinate */}
        {minorTicks.map((v) => {
          const angle = valueToAngle(v, min, max)
          const outer = polarToCartesian(angle, RADIUS + STROKE_WIDTH / 2 + 4)
          const inner = polarToCartesian(angle, RADIUS + STROKE_WIDTH / 2)
          return (
            <line
              key={`minor-${v}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="rgba(30, 20, 16, 0.22)"
              strokeWidth={1}
            />
          )
        })}

        {/* Major (integer) ticks with labels */}
        {majorTicks.map((v) => {
          const angle = valueToAngle(v, min, max)
          const outer = polarToCartesian(angle, RADIUS + STROKE_WIDTH / 2 + 6)
          const inner = polarToCartesian(angle, RADIUS - STROKE_WIDTH / 2 - 4)
          const labelPos = polarToCartesian(angle, RADIUS + STROKE_WIDTH / 2 + 22)
          return (
            <g key={`major-${v}`}>
              <line
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="rgba(30, 20, 16, 0.35)"
                strokeWidth={1.5}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="rgba(30, 20, 16, 0.55)"
                fontSize="13"
                fontFamily="Geist, system-ui, sans-serif"
                fontWeight={500}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {v.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Keyboard-focus halo behind the handle — visibility is driven purely by
            CSS :focus-visible (see index.css), so pointer users never see it */}
        <circle
          className="palato-dial-halo"
          cx={handlePos.x}
          cy={handlePos.y}
          r={26}
          fill="rgba(217, 78, 31, 0.22)"
          style={{
            transition: isDragging ? 'none' : 'opacity 0.15s, cx 150ms ease-out, cy 150ms ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Handle — purely visual; touches pass through to the hit band below */}
        <circle
          cx={handlePos.x}
          cy={handlePos.y}
          r={14}
          fill={value !== null ? '#D94E1F' : 'rgba(30, 20, 16, 0.2)'}
          stroke="#F4EAD5"
          strokeWidth={3}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(30, 20, 16, 0.2))',
            // Snap the handle for keyboard/tap updates; live-track while dragging
            transition: isDragging ? 'none' : 'fill 0.15s, cx 150ms ease-out, cy 150ms ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Invisible fat hit target tracing the arc. This is the only element
            that owns touches, so the center, corners, and bottom gap stay free
            to scroll the page. Rendered last so it wins over the visible arc. */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="transparent"
          strokeWidth={44}
          strokeLinecap="round"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            touchAction: 'none',
            pointerEvents: 'stroke',
            cursor: isDragging ? 'grabbing' : 'pointer',
          }}
        />
      </svg>

      {/* Center value display — hidden from screen readers; the slider's
          aria-valuetext already announces the value */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          textAlign: 'center',
          width: '100%',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontStyle: 'italic',
            fontSize: '4.5rem',
            color: value !== null ? '#1E1410' : 'rgba(30, 20, 16, 0.25)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {value !== null ? value.toFixed(1) : '—'}
        </div>
        <div
          style={{
            fontFamily: 'Geist, system-ui, sans-serif',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'rgba(30, 20, 16, 0.4)',
            marginTop: '0.6rem',
          }}
        >
          {value === null ? 'Tap or drag' : 'Out of 5'}
        </div>
      </div>
    </div>
  )
}