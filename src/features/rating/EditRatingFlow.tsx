import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { RatingForm, type RatingFormSubmitPayload } from './RatingForm'
import type { RatedCoffee } from '../../lib/useUserRatings'

const espresso = '#1E1410'

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
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    opacity: 0.55,
    color: espresso,
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
  const coffee = existing.coffee!

  const initialBrewTime = (() => {
    if (!existing.brew_time_seconds) return ''
    const m = Math.floor(existing.brew_time_seconds / 60)
    const sec = existing.brew_time_seconds % 60
    return sec > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${m}:00`
  })()

  const initialWaterTemp = existing.water_temp_celsius
    ? String(Math.round(existing.water_temp_celsius * 9 / 5 + 32))
    : ''

  const handleSubmit = async (payload: RatingFormSubmitPayload) => {
    if (!user) throw new Error('Not signed in.')

    const ratingRow: Record<string, unknown> = {
      rating: payload.rating,
      user_tasting_notes: payload.tastingNotes,
      extraction_quality: payload.extraction,
      brew_method: payload.brewMethod,
      dose_grams: payload.doseGrams,
      yield_grams: payload.yieldGrams,
      brew_time_seconds: payload.brewTimeSeconds,
      grind_size: payload.grindSize,
      water_temp_celsius: payload.waterTempCelsius,
    }
    if (payload.body !== null) ratingRow.body = payload.body
    if (payload.acidity !== null) ratingRow.acidity = payload.acidity

    const { error: updateError } = await supabase
      .from('ratings')
      .update(ratingRow)
      .eq('id', existing.id)

    if (updateError) throw new Error(updateError.message)

    await supabase.from('rating_flavor_descriptors').delete().eq('rating_id', existing.id)
    if (payload.descriptorIds.length > 0) {
      const rows = payload.descriptorIds.map((descriptorId) => ({
        rating_id: existing.id,
        descriptor_id: descriptorId,
      }))
      await supabase.from('rating_flavor_descriptors').insert(rows)
    }

    onSaved()
  }

  return (
    <div style={s.container}>
      <button onClick={onCancel} style={s.backLink}>← Back to journal</button>
      <h2 style={s.heading}>Edit rating</h2>

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

      <RatingForm
        initial={{
          rating: existing.rating,
          tastingNotes: existing.user_tasting_notes ?? '',
          descriptorIds: existing.descriptors.map((d) => d.id),
          body: existing.body,
          acidity: existing.acidity,
          extraction: (existing.extraction_quality as 'under' | 'ideal' | 'over' | null) ?? null,
          brewMethod: existing.brew_method,
          doseGrams: existing.dose_grams?.toString() ?? '',
          waterGrams: existing.yield_grams?.toString() ?? '',
          brewTime: initialBrewTime,
          grindSize: existing.grind_size ?? '',
          waterTemp: initialWaterTemp,
          tempUnit: 'F',
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  )
}
