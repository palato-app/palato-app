import { useEffect, useState } from 'react'
import { useCoffee } from './lib/useCoffee'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'
import { RatingForm, type RatingFormSubmitPayload } from './components/RatingForm'

const ROAST_LABELS: Record<string, string> = {
  light: 'Light',
  medium_light: 'Medium-light',
  medium: 'Medium',
  medium_dark: 'Medium-dark',
  dark: 'Dark',
  unspecified: '',
}

const styles = {
  container: { marginTop: '3rem' } as const,
  backLink: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#1E1410',
    opacity: 0.6,
    cursor: 'pointer' as const,
    marginBottom: '2.5rem',
  } as const,
  coffeeContext: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(30, 20, 16, 0.15)',
    marginBottom: '3rem',
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
  coffeeContextText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.15rem',
  } as const,
  coffeeContextRoaster: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.6,
  } as const,
  coffeeContextName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.5rem',
    color: '#1E1410',
    margin: 0,
    lineHeight: 1.15,
  } as const,
}

const interstitialStyles = {
  container: {
    marginTop: '8rem',
    textAlign: 'center' as const,
    padding: '2rem',
  } as const,
  headline: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: 'clamp(4rem, 9vw, 7rem)',
    color: '#D94E1F',
    margin: '0 0 1.5rem',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  } as const,
  stat: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1.1rem',
    color: '#1E1410',
    opacity: 0.7,
    margin: 0,
  } as const,
}

type Props = {
  coffeeId: string
  onCancel: () => void
  onComplete: () => void
}

export function RateCoffee({ coffeeId, onCancel, onComplete }: Props) {
  const { coffee, loading: coffeeLoading } = useCoffee(coffeeId)
  const { user } = useAuth()

  const [submitted, setSubmitted] = useState(false)
  const [coffeeCount, setCoffeeCount] = useState<number | null>(null)

  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => onComplete(), 2000)
    return () => clearTimeout(timer)
  }, [submitted, onComplete])

  const handleSubmit = async (payload: RatingFormSubmitPayload) => {
    if (!user) throw new Error('Not signed in.')

    const ratingRow: Record<string, unknown> = {
      user_id: user.id,
      coffee_id: coffeeId,
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

    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .insert(ratingRow)
      .select('id')
      .single()

    if (ratingError || !ratingData) {
      throw new Error(ratingError?.message ?? 'Something went wrong.')
    }

    if (payload.descriptorIds.length > 0) {
      const rows = payload.descriptorIds.map((descriptorId) => ({
        rating_id: ratingData.id,
        descriptor_id: descriptorId,
      }))
      const { error: descError } = await supabase
        .from('rating_flavor_descriptors')
        .insert(rows)
      if (descError) console.error('Failed to save descriptors:', descError.message)
    }

    const { count } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setCoffeeCount(count)
    setSubmitted(true)
  }

  if (coffeeLoading) {
    return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Loading…</p>
  }

  if (!coffee) {
    return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Coffee not found.</p>
  }

  if (submitted) {
    return (
      <div style={interstitialStyles.container}>
        <h2 style={interstitialStyles.headline}>Logged.</h2>
        <p style={interstitialStyles.stat}>
          {coffeeCount !== null
            ? `That's coffee #${coffeeCount} for you.`
            : 'Your palate is getting sharper.'}
        </p>
      </div>
    )
  }

  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  return (
    <div style={styles.container}>
      <button onClick={onCancel} style={styles.backLink}>
        ← Back
      </button>

      <div style={styles.coffeeContext}>
        {coffee.bag_image_url ? (
          <img
            src={coffee.bag_image_url}
            alt={`${coffee.coffee_name} bag`}
            style={styles.coffeeContextImage}
          />
        ) : (
          <div style={styles.coffeeContextImage} />
        )}
        <div style={styles.coffeeContextText}>
          <span style={styles.coffeeContextRoaster}>
            {coffee.roaster_name}
            {roastLabel && ` · ${roastLabel}`}
          </span>
          <h2 style={styles.coffeeContextName}>{coffee.coffee_name}</h2>
        </div>
      </div>

      <RatingForm onSubmit={handleSubmit} submitLabel="Log it" />
    </div>
  )
}
