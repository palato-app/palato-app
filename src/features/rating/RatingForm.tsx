import { useState, useCallback } from 'react'
import { RatingDial } from './RatingDial'
import { GradientSlider } from '../../components/GradientSlider'
import { HighlightedTextarea } from '../../components/HighlightedTextarea'
import { useFlavorDescriptors } from '../../lib/useFlavorDescriptors'

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const BREW_METHODS = [
  { value: 'v60', label: 'V60' },
  { value: 'drip', label: 'Drip' },
  { value: 'aeropress', label: 'AeroPress' },
  { value: 'chemex', label: 'Chemex' },
  { value: 'kalita', label: 'Kalita' },
  { value: 'french_press', label: 'French Press' },
  { value: 'other', label: 'Other' },
]

const GRIND_OPTIONS = [
  { value: 'extra_fine', label: 'Extra fine' },
  { value: 'fine', label: 'Fine' },
  { value: 'medium_fine', label: 'Medium-fine' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium_coarse', label: 'Medium-coarse' },
  { value: 'coarse', label: 'Coarse' },
  { value: 'extra_coarse', label: 'Extra coarse' },
]

const s = {
  section: { marginBottom: '2.5rem' } as const,
  sectionLabel: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: espresso,
    opacity: 0.55,
    margin: '0 0 1rem',
  } as const,
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    opacity: 0.55,
    color: espresso,
  } as const,
  input: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: espresso,
    width: '100%',
    boxSizing: 'border-box' as const,
  } as const,
  select: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    padding: '0.65rem 0.85rem',
    border: '1px solid rgba(30, 20, 16, 0.25)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: espresso,
    width: '100%',
    cursor: 'pointer' as const,
  } as const,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
  } as const,
  chip: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '100px',
    border: '1px solid',
    cursor: 'pointer' as const,
    transition: 'all 0.12s',
    fontWeight: 500,
  } as const,
  toggleLink: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0',
    fontFamily: 'Geist, system-ui, sans-serif',
    color: espresso,
    opacity: 0.4,
    cursor: 'pointer' as const,
    display: 'block',
    fontSize: '0.8rem',
    marginTop: '0.75rem',
    marginBottom: '0.5rem',
  } as const,
  helperText: {
    fontSize: '0.8rem',
    opacity: 0.55,
    fontStyle: 'italic' as const,
    fontFamily: 'Geist, system-ui, sans-serif',
    color: espresso,
  } as const,
  fieldGroup: { display: 'grid', gap: '0.35rem' } as const,
  brewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
  } as const,
  primaryButton: {
    padding: '1rem 2.5rem',
    backgroundColor: ember,
    color: cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    transition: 'opacity 0.15s',
  } as const,
  submitRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  error: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: ember,
    margin: 0,
  } as const,
}

export type RatingFormSubmitPayload = {
  rating: number
  tastingNotes: string | null
  descriptorIds: string[]
  body: number | null
  acidity: number | null
  extraction: 'under' | 'ideal' | 'over' | null
  brewMethod: string | null
  doseGrams: number | null
  yieldGrams: number | null
  brewTimeSeconds: number | null
  grindSize: string | null
  waterTempCelsius: number | null
}

export type RatingFormInitial = {
  rating?: number | null
  tastingNotes?: string
  descriptorIds?: string[]
  body?: number | null
  acidity?: number | null
  extraction?: 'under' | 'ideal' | 'over' | null
  brewMethod?: string | null
  brewMethodOther?: string
  doseGrams?: string
  waterGrams?: string
  brewTime?: string
  grindSize?: string
  waterTemp?: string
  tempUnit?: 'C' | 'F'
}

type Props = {
  initial?: RatingFormInitial
  onSubmit: (payload: RatingFormSubmitPayload) => Promise<void> | void
  submitLabel?: string
  submittingLabel?: string
}

export function RatingForm({
  initial,
  onSubmit,
  submitLabel = 'Log it',
  submittingLabel = 'Saving…',
}: Props) {
  const { descriptors, loading: descriptorsLoading } = useFlavorDescriptors()

  const [rating, setRating] = useState<number | null>(initial?.rating ?? null)
  const [tastingNotes, setTastingNotes] = useState(initial?.tastingNotes ?? '')
  const [autoMatchedIds, setAutoMatchedIds] = useState<Set<string>>(new Set())
  const [manuallySelectedIds, setManuallySelectedIds] = useState<Set<string>>(
    new Set(initial?.descriptorIds ?? [])
  )
  const [manuallyDeselectedIds, setManuallyDeselectedIds] = useState<Set<string>>(new Set())
  const [showMoreFlavors, setShowMoreFlavors] = useState(false)
  const [flavorSearch, setFlavorSearch] = useState('')
  const [body, setBody] = useState<number | null>(initial?.body ?? null)
  const [acidity, setAcidity] = useState<number | null>(initial?.acidity ?? null)
  const [extraction, setExtraction] = useState<'under' | 'ideal' | 'over' | null>(
    initial?.extraction ?? null
  )
  const [brewMethod, setBrewMethod] = useState<string | null>(initial?.brewMethod ?? null)
  const [brewMethodOther, setBrewMethodOther] = useState(initial?.brewMethodOther ?? '')
  const [doseGrams, setDoseGrams] = useState(initial?.doseGrams ?? '')
  const [waterGrams, setWaterGrams] = useState(initial?.waterGrams ?? '')
  const [brewTime, setBrewTime] = useState(initial?.brewTime ?? '')
  const [grindSize, setGrindSize] = useState(initial?.grindSize ?? '')
  const [waterTemp, setWaterTemp] = useState(initial?.waterTemp ?? '')
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(initial?.tempUnit ?? 'F')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const activeDescriptorIds = new Set([
    ...Array.from(autoMatchedIds).filter((id) => !manuallyDeselectedIds.has(id)),
    ...manuallySelectedIds,
  ])

  const handleMatchedDescriptors = useCallback((ids: Set<string>) => {
    setAutoMatchedIds(ids)
  }, [])

  const handleSubmit = async () => {
    if (rating === null) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const brewTimeSeconds = brewTime
        ? (() => {
            const parts = brewTime.split(':')
            if (parts.length === 2)
              return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
            return parseInt(brewTime, 10) || null
          })()
        : null

      const waterTempCelsius = waterTemp
        ? tempUnit === 'F'
          ? Math.round(((parseFloat(waterTemp) - 32) * 5) / 9 * 10) / 10
          : parseFloat(waterTemp)
        : null

      const effectiveBrewMethod =
        brewMethod === 'other' && brewMethodOther.trim() ? 'other' : brewMethod

      await onSubmit({
        rating,
        tastingNotes: tastingNotes.trim() || null,
        descriptorIds: Array.from(activeDescriptorIds),
        body,
        acidity,
        extraction,
        brewMethod: effectiveBrewMethod,
        doseGrams: doseGrams ? parseFloat(doseGrams) : null,
        yieldGrams: waterGrams ? parseFloat(waterGrams) : null,
        brewTimeSeconds,
        grindSize: grindSize || null,
        waterTempCelsius,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDescriptors = flavorSearch.trim()
    ? descriptors.filter((d) => {
        const q = flavorSearch.toLowerCase()
        return (
          d.descriptor.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      })
    : descriptors

  const grouped = filteredDescriptors.reduce<Record<string, typeof descriptors>>(
    (acc, d) => {
      if (!acc[d.category]) acc[d.category] = []
      acc[d.category].push(d)
      return acc
    },
    {}
  )

  return (
    <>
      <section style={{ ...s.section, textAlign: 'center' }}>
        <p style={s.sectionLabel}>How was it?</p>
        <RatingDial value={rating} onChange={setRating} />
      </section>

      <section style={s.section}>
        <p style={s.sectionLabel}>What did you taste?</p>
        {!descriptorsLoading && (
          <HighlightedTextarea
            value={tastingNotes}
            onChange={setTastingNotes}
            descriptors={descriptors}
            onMatchedDescriptors={handleMatchedDescriptors}
          />
        )}
        {activeDescriptorIds.size > 0 && (
          <div style={{ ...s.chipRow, marginTop: '0.75rem' }}>
            {descriptors
              .filter((d) => activeDescriptorIds.has(d.id))
              .map((d) => {
                const color = d.category_icon_color ?? espresso
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      if (manuallySelectedIds.has(d.id)) {
                        setManuallySelectedIds((prev) => {
                          const next = new Set(prev)
                          next.delete(d.id)
                          return next
                        })
                      } else if (autoMatchedIds.has(d.id)) {
                        setManuallyDeselectedIds((prev) => new Set(prev).add(d.id))
                      }
                    }}
                    style={{
                      ...s.chip,
                      background: color,
                      color: cream,
                      borderColor: color,
                    }}
                  >
                    {d.descriptor} ×
                  </button>
                )
              })}
          </div>
        )}
        <button
          onClick={() => setShowMoreFlavors(!showMoreFlavors)}
          style={s.toggleLink}
        >
          {showMoreFlavors ? '− Hide flavor list' : '+ Add more flavors'}
        </button>
        {showMoreFlavors && (
          <div>
            <input
              type="text"
              value={flavorSearch}
              onChange={(e) => setFlavorSearch(e.target.value)}
              placeholder="Search flavors…"
              style={{ ...s.input, marginBottom: '1rem' }}
            />
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <p style={{ ...s.label, fontSize: '0.6rem', margin: '0 0 0.4rem' }}>
                  {category}
                </p>
                <div style={s.chipRow}>
                  {items.map((d) => {
                    const isActive = activeDescriptorIds.has(d.id)
                    const color = d.category_icon_color ?? espresso
                    const tint = d.category_pill_tint ?? 'rgba(30, 20, 16, 0.06)'
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          if (isActive) {
                            setManuallySelectedIds((prev) => {
                              const next = new Set(prev)
                              next.delete(d.id)
                              return next
                            })
                            if (autoMatchedIds.has(d.id)) {
                              setManuallyDeselectedIds((prev) =>
                                new Set(prev).add(d.id)
                              )
                            }
                          } else {
                            setManuallySelectedIds((prev) => new Set(prev).add(d.id))
                            setManuallyDeselectedIds((prev) => {
                              const next = new Set(prev)
                              next.delete(d.id)
                              return next
                            })
                          }
                        }}
                        style={{
                          ...s.chip,
                          background: isActive ? color : tint,
                          color: isActive ? cream : color,
                          borderColor: isActive ? color : `${color}40`,
                        }}
                      >
                        {d.descriptor}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={s.section}>
        <p style={s.sectionLabel}>Body & Acidity</p>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ ...s.label, marginBottom: '0.5rem' }}>Body</p>
          <GradientSlider
            value={body}
            onChange={setBody}
            leftLabel="Light"
            rightLabel="Full"
            gradientColors={['#C89040', '#5C3A1E']}
          />
        </div>
        <div>
          <p style={{ ...s.label, marginBottom: '0.5rem' }}>Acidity</p>
          <GradientSlider
            value={acidity}
            onChange={setAcidity}
            leftLabel="Low"
            rightLabel="Bright"
            gradientColors={['#A67A28', '#D94E1F']}
          />
        </div>
      </section>

      <section style={s.section}>
        <p style={s.sectionLabel}>Extraction</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(
            [
              { value: 'under' as const, label: 'Under' },
              { value: 'ideal' as const, label: 'Balanced' },
              { value: 'over' as const, label: 'Over' },
            ]
          ).map((opt) => {
            const isActive = extraction === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setExtraction(isActive ? null : opt.value)}
                style={{
                  ...s.chip,
                  flex: 1,
                  textAlign: 'center',
                  background: isActive ? espresso : 'rgba(30, 20, 16, 0.06)',
                  color: isActive ? cream : espresso,
                  borderColor: isActive ? espresso : 'rgba(30, 20, 16, 0.15)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      <section style={s.section}>
        <p style={s.sectionLabel}>Brew Method</p>
        <div style={s.chipRow}>
          {BREW_METHODS.map((m) => {
            const isActive = brewMethod === m.value
            return (
              <button
                key={m.value}
                onClick={() => setBrewMethod(isActive ? null : m.value)}
                style={{
                  ...s.chip,
                  background: isActive ? espresso : 'rgba(30, 20, 16, 0.06)',
                  color: isActive ? cream : espresso,
                  borderColor: isActive ? espresso : 'rgba(30, 20, 16, 0.15)',
                }}
              >
                {m.label}
              </button>
            )
          })}
        </div>
        {brewMethod === 'other' && (
          <input
            style={{ ...s.input, marginTop: '0.75rem' }}
            type="text"
            value={brewMethodOther}
            onChange={(e) => setBrewMethodOther(e.target.value)}
            placeholder="What method?"
          />
        )}

        {brewMethod && (
          <>
            <div className="palato-brew-grid" style={s.brewGrid}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Coffee (g)</label>
                <input
                  style={s.input}
                  type="number"
                  value={doseGrams}
                  onChange={(e) => setDoseGrams(e.target.value)}
                  placeholder="e.g. 18"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Water (g)</label>
                <input
                  style={s.input}
                  type="number"
                  value={waterGrams}
                  onChange={(e) => setWaterGrams(e.target.value)}
                  placeholder="e.g. 300"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Water temp</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    type="number"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(e.target.value)}
                    placeholder={tempUnit === 'C' ? 'e.g. 96' : 'e.g. 205'}
                  />
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(30, 20, 16, 0.25)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setTempUnit('C')}
                      style={{
                        padding: '0.5rem 0.7rem',
                        border: 'none',
                        fontFamily: 'Geist, system-ui, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: tempUnit === 'C' ? espresso : 'rgba(255,255,255,0.4)',
                        color: tempUnit === 'C' ? cream : espresso,
                      }}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempUnit('F')}
                      style={{
                        padding: '0.5rem 0.7rem',
                        border: 'none',
                        borderLeft: '1px solid rgba(30, 20, 16, 0.15)',
                        fontFamily: 'Geist, system-ui, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: tempUnit === 'F' ? espresso : 'rgba(255,255,255,0.4)',
                        color: tempUnit === 'F' ? cream : espresso,
                      }}
                    >
                      °F
                    </button>
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Brew time</label>
                <input
                  style={s.input}
                  type="text"
                  value={brewTime}
                  onChange={(e) => setBrewTime(e.target.value)}
                  placeholder="e.g. 3:30"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Grind size</label>
                <select
                  style={s.select}
                  value={grindSize}
                  onChange={(e) => setGrindSize(e.target.value)}
                >
                  <option value="">Select</option>
                  {GRIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {doseGrams && waterGrams && parseFloat(doseGrams) > 0 && (
              <p
                style={{
                  ...s.helperText,
                  marginTop: '0.75rem',
                  fontStyle: 'normal',
                  opacity: 0.7,
                  fontWeight: 500,
                }}
              >
                Ratio: 1:{Math.round(parseFloat(waterGrams) / parseFloat(doseGrams))}
              </p>
            )}
          </>
        )}
      </section>

      <div style={s.submitRow}>
        {submitError && <p style={s.error}>Couldn't save: {submitError}</p>}
        <button
          onClick={handleSubmit}
          disabled={rating === null || submitting}
          style={{
            ...s.primaryButton,
            opacity: rating === null || submitting ? 0.4 : 1,
            cursor: rating === null || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </>
  )
}
