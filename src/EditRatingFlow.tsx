import { useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'
import { useFlavorDescriptors } from './lib/useFlavorDescriptors'
import { RatingDial } from './RatingDial'
import { GradientSlider } from './components/GradientSlider'
import { HighlightedTextarea } from './components/HighlightedTextarea'
import type { RatedCoffee } from './lib/useUserRatings'

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

const cream = '#F4EAD5'
const espresso = '#1E1410'
const ember = '#D94E1F'

const s = {
  container: { marginTop: '2rem', maxWidth: '600px' } as const,
  backLink: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: espresso,
    opacity: 0.6,
    cursor: 'pointer' as const,
    marginBottom: '1.5rem',
    display: 'block',
  } as const,
  heading: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '2rem',
    fontStyle: 'italic' as const,
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
    color: espresso,
  } as const,
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
  primaryButton: {
    padding: '0.85rem 1.75rem',
    backgroundColor: ember,
    color: cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    marginTop: '0.5rem',
  } as const,
  section: { marginBottom: '2.5rem' } as const,
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
  error: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: ember,
    margin: 0,
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
  coffeeContext: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(30, 20, 16, 0.15)',
    marginBottom: '2.5rem',
  } as const,
  coffeeContextImage: {
    width: '72px',
    height: '72px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    border: '1px solid rgba(30, 20, 16, 0.15)',
    background: 'rgba(30, 20, 16, 0.05)',
    flexShrink: 0,
  } as const,
}

type Props = {
  rating: RatedCoffee
  onCancel: () => void
  onSaved: () => void
}

export function EditRatingFlow({ rating: existing, onCancel, onSaved }: Props) {
  const { user } = useAuth()
  const { descriptors, loading: descriptorsLoading } = useFlavorDescriptors()
  const coffee = existing.coffee!

  const [rating, setRating] = useState<number | null>(existing.rating)
  const [tastingNotes, setTastingNotes] = useState(existing.user_tasting_notes ?? '')
  const existingDescriptorIds = new Set(existing.descriptors.map((d) => d.id))
  const [autoMatchedIds, setAutoMatchedIds] = useState<Set<string>>(new Set())
  const [manuallySelectedIds, setManuallySelectedIds] = useState<Set<string>>(existingDescriptorIds)
  const [manuallyDeselectedIds, setManuallyDeselectedIds] = useState<Set<string>>(new Set())
  const [showMoreFlavors, setShowMoreFlavors] = useState(false)
  const [flavorSearch, setFlavorSearch] = useState('')
  const [body, setBody] = useState<number | null>(existing.body)
  const [acidity, setAcidity] = useState<number | null>(existing.acidity)
  const [extraction, setExtraction] = useState<'under' | 'ideal' | 'over' | null>(
    (existing.extraction_quality as 'under' | 'ideal' | 'over') ?? null
  )
  const [brewMethod, setBrewMethod] = useState<string | null>(existing.brew_method)
  const [brewMethodOther, setBrewMethodOther] = useState('')
  const [doseGrams, setDoseGrams] = useState(existing.dose_grams?.toString() ?? '')
  const [waterGrams, setWaterGrams] = useState(existing.yield_grams?.toString() ?? '')
  const [brewTime, setBrewTime] = useState(() => {
    if (!existing.brew_time_seconds) return ''
    const m = Math.floor(existing.brew_time_seconds / 60)
    const sec = existing.brew_time_seconds % 60
    return sec > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${m}:00`
  })
  const [grindSize, setGrindSize] = useState(existing.grind_size ?? '')
  const [waterTemp, setWaterTemp] = useState(() => {
    if (!existing.water_temp_celsius) return ''
    return String(Math.round(existing.water_temp_celsius * 9 / 5 + 32))
  })
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('F')
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
    if (rating === null || !user) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const effectiveBrewMethod = brewMethod === 'other' && brewMethodOther.trim()
        ? 'other'
        : brewMethod

      const brewTimeSecs = brewTime
        ? (() => {
            const parts = brewTime.split(':')
            if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
            return parseInt(brewTime, 10) || null
          })()
        : null

      const waterTempCelsius = waterTemp
        ? tempUnit === 'F'
          ? Math.round(((parseFloat(waterTemp) - 32) * 5) / 9 * 10) / 10
          : parseFloat(waterTemp)
        : null

      const ratingRow: Record<string, unknown> = {
        rating,
        user_tasting_notes: tastingNotes.trim() || null,
        extraction_quality: extraction,
        brew_method: effectiveBrewMethod,
        dose_grams: doseGrams ? parseFloat(doseGrams) : null,
        yield_grams: waterGrams ? parseFloat(waterGrams) : null,
        brew_time_seconds: brewTimeSecs,
        grind_size: grindSize || null,
        water_temp_celsius: waterTempCelsius,
      }
      if (body !== null) ratingRow.body = body
      if (acidity !== null) ratingRow.acidity = acidity

      const { error: updateError } = await supabase
        .from('ratings')
        .update(ratingRow)
        .eq('id', existing.id)

      if (updateError) throw new Error(updateError.message)

      // Replace descriptors: delete old, insert new
      await supabase.from('rating_flavor_descriptors').delete().eq('rating_id', existing.id)
      if (activeDescriptorIds.size > 0) {
        const rows = Array.from(activeDescriptorIds).map((descriptorId) => ({
          rating_id: existing.id,
          descriptor_id: descriptorId,
        }))
        await supabase.from('rating_flavor_descriptors').insert(rows)
      }

      onSaved()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update rating.')
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
    <div style={s.container}>
      <button onClick={onCancel} style={s.backLink}>← Back to journal</button>
      <h2 style={s.heading}>Edit rating</h2>

      {/* Coffee context */}
      <div style={s.coffeeContext}>
        {coffee.bag_image_url ? (
          <img src={coffee.bag_image_url} alt={coffee.coffee_name} style={s.coffeeContextImage} />
        ) : (
          <div style={s.coffeeContextImage} />
        )}
        <div>
          <span style={{ ...s.label, margin: 0 }}>{coffee.roaster_name}</span>
          <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.5rem', color: espresso, margin: '0.15rem 0 0', lineHeight: 1.15 }}>
            {coffee.coffee_name}
          </h3>
        </div>
      </div>

      {/* Rating dial */}
      <section style={{ ...s.section, textAlign: 'center' }}>
        <p style={s.sectionLabel}>How was it?</p>
        <RatingDial value={rating} onChange={setRating} />
      </section>

      {/* Tasting notes with auto-highlight */}
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
          style={{ ...s.backLink, opacity: 0.4, fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}
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
                <p style={{ ...s.label, fontSize: '0.6rem', margin: '0 0 0.4rem' }}>{category}</p>
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
                              setManuallyDeselectedIds((prev) => new Set(prev).add(d.id))
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

      {/* Body & Acidity sliders */}
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

      {/* Extraction */}
      <section style={s.section}>
        <p style={s.sectionLabel}>Extraction</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {([
            { value: 'under' as const, label: 'Under' },
            { value: 'ideal' as const, label: 'Balanced' },
            { value: 'over' as const, label: 'Over' },
          ]).map((opt) => {
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

      {/* Brew method */}
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
            <div style={s.brewGrid}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Coffee (g)</label>
                <input style={s.input} type="number" value={doseGrams} onChange={(e) => setDoseGrams(e.target.value)} placeholder="e.g. 18" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Water (g)</label>
                <input style={s.input} type="number" value={waterGrams} onChange={(e) => setWaterGrams(e.target.value)} placeholder="e.g. 300" />
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
                  <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(30, 20, 16, 0.25)' }}>
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
                <input style={s.input} type="text" value={brewTime} onChange={(e) => setBrewTime(e.target.value)} placeholder="e.g. 3:30" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Grind size</label>
                <select style={s.select} value={grindSize} onChange={(e) => setGrindSize(e.target.value)}>
                  <option value="">Select</option>
                  {GRIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {doseGrams && waterGrams && parseFloat(doseGrams) > 0 && (
              <p style={{ ...s.helperText, marginTop: '0.75rem', fontStyle: 'normal', opacity: 0.7, fontWeight: 500 }}>
                Ratio: 1:{Math.round(parseFloat(waterGrams) / parseFloat(doseGrams))}
              </p>
            )}
          </>
        )}
      </section>

      {/* Submit */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(30, 20, 16, 0.15)',
        }}
      >
        {submitError && <p style={s.error}>Couldn't save: {submitError}</p>}
        <button
          onClick={handleSubmit}
          disabled={rating === null || submitting}
          style={{
            ...s.primaryButton,
            padding: '1rem 2.5rem',
            opacity: rating === null || submitting ? 0.4 : 1,
            cursor: rating === null || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
