import { useEffect, useState } from 'react'
import { useCoffee } from './lib/useCoffee'
import { useFlavorDescriptors, type FlavorDescriptor } from './lib/useFlavorDescriptors'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'

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
  section: { marginBottom: '3rem' } as const,
  label: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#1E1410',
    opacity: 0.55,
    margin: '0 0 1rem',
  } as const,
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  } as const,
  slider: {
    flex: 1,
    height: '4px',
    accentColor: '#D94E1F',
    cursor: 'pointer' as const,
  } as const,
  ratingValue: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '3rem',
    color: '#1E1410',
    lineHeight: 1,
    minWidth: '4rem',
    textAlign: 'right' as const,
    fontStyle: 'italic' as const,
  } as const,
  ratingValueMuted: {
    opacity: 0.25,
  } as const,
  textarea: {
    width: '100%',
    minHeight: '5rem',
    padding: '0.85rem 1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '1rem',
    color: '#1E1410',
    background: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(30, 20, 16, 0.2)',
    borderRadius: '8px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    lineHeight: 1.5,
  } as const,
  searchInput: {
    width: '100%',
    padding: '0.7rem 1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.95rem',
    color: '#1E1410',
    background: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(30, 20, 16, 0.2)',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    marginBottom: '1.5rem',
  } as const,
  categoryGroup: { marginBottom: '1.5rem' } as const,
  categoryHeader: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#1E1410',
    opacity: 0.5,
    margin: '0 0 0.6rem',
  } as const,
  chipsWrap: {
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
  emptyState: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1rem',
    color: '#1E1410',
    opacity: 0.5,
    fontStyle: 'italic' as const,
    margin: '1rem 0',
  } as const,
  submitRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  submitButton: {
    padding: '1rem 2.5rem',
    backgroundColor: '#D94E1F',
    color: '#F4EAD5',
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    transition: 'opacity 0.15s',
  } as const,
  error: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#D94E1F',
    margin: 0,
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
  const { descriptors, loading: descriptorsLoading } = useFlavorDescriptors()
  const { user } = useAuth()

  const [rating, setRating] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [selectedDescriptorIds, setSelectedDescriptorIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [coffeeCount, setCoffeeCount] = useState<number | null>(null)

  // Auto-redirect after successful submission
  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => onComplete(), 2000)
    return () => clearTimeout(timer)
  }, [submitted, onComplete])

  const toggleDescriptor = (id: string) => {
    setSelectedDescriptorIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    if (rating === null || !user) return

    setSubmitting(true)
    setSubmitError(null)

    // 1. Insert the rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .insert({
        user_id: user.id,
        coffee_id: coffeeId,
        rating,
        user_tasting_notes: tastingNotes.trim() || null,
      })
      .select('id')
      .single()

    if (ratingError || !ratingData) {
      setSubmitting(false)
      setSubmitError(ratingError?.message ?? 'Something went wrong.')
      return
    }

    // 2. Insert flavor descriptor links (if any)
    if (selectedDescriptorIds.size > 0) {
      const rows = Array.from(selectedDescriptorIds).map((descriptorId) => ({
        rating_id: ratingData.id,
        descriptor_id: descriptorId,
      }))

      const { error: descError } = await supabase
        .from('rating_flavor_descriptors')
        .insert(rows)

      if (descError) {
        // Rating saved but descriptors didn't — log and continue
        // The rating still counts; user can re-tag later (once edit is built)
        console.error('Failed to save descriptors:', descError.message)
      }
    }

    // 3. Get total rating count for the interstitial
    const { count } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setCoffeeCount(count)
    setSubmitting(false)
    setSubmitted(true)
  }

  // Filter descriptors by search query
  const filteredDescriptors = searchQuery.trim()
    ? descriptors.filter((d) => {
        const q = searchQuery.toLowerCase()
        return (
          d.descriptor.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.subcategory.toLowerCase().includes(q) ||
          d.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      })
    : descriptors

  // Group filtered descriptors by category for visual organization
  const grouped = filteredDescriptors.reduce<Record<string, FlavorDescriptor[]>>(
    (acc, d) => {
      if (!acc[d.category]) acc[d.category] = []
      acc[d.category].push(d)
      return acc
    },
    {}
  )

  // Loading states
  if (coffeeLoading || descriptorsLoading) {
    return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Loading…</p>
  }

  if (!coffee) {
    return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Coffee not found.</p>
  }

  // Interstitial state — auto-redirects after 2s
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

      {/* Coffee context */}
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

      {/* Rating */}
      <section style={styles.section}>
        <p style={styles.label}>How was it?</p>
        <div style={styles.ratingRow}>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={rating ?? 3.0}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            style={styles.slider}
            aria-label="Rating"
          />
          <span
            style={{
              ...styles.ratingValue,
              ...(rating === null ? styles.ratingValueMuted : {}),
            }}
          >
            {rating !== null ? rating.toFixed(1) : '—'}
          </span>
        </div>
      </section>

      {/* Tasting notes */}
      <section style={styles.section}>
        <p style={styles.label}>Anything specific?</p>
        <textarea
          value={tastingNotes}
          onChange={(e) => setTastingNotes(e.target.value)}
          placeholder="What stood out?"
          style={styles.textarea}
        />
      </section>

      {/* Flavor descriptors */}
      <section style={styles.section}>
        <p style={styles.label}>What did you taste?</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flavors — citrus, chocolate, jasmine…"
          style={styles.searchInput}
        />

        {filteredDescriptors.length === 0 ? (
          <p style={styles.emptyState}>
            Nothing matches "{searchQuery}". Try a different word.
          </p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={styles.categoryGroup}>
              <p style={styles.categoryHeader}>{category}</p>
              <div style={styles.chipsWrap}>
                {items.map((d) => {
                  const isSelected = selectedDescriptorIds.has(d.id)
                  const iconColor = d.category_icon_color ?? '#1E1410'
                  const tintColor = d.category_pill_tint ?? 'rgba(30, 20, 16, 0.06)'
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDescriptor(d.id)}
                      style={{
                        ...styles.chip,
                        background: isSelected ? iconColor : tintColor,
                        color: isSelected ? '#F4EAD5' : iconColor,
                        borderColor: isSelected ? iconColor : `${iconColor}40`,
                      }}
                    >
                      {d.descriptor}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Submit */}
      <div style={styles.submitRow}>
        {submitError && <p style={styles.error}>Couldn't save: {submitError}</p>}
        <button
          onClick={handleSubmit}
          disabled={rating === null || submitting}
          style={{
            ...styles.submitButton,
            opacity: rating === null || submitting ? 0.4 : 1,
            cursor: rating === null || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Saving…' : 'Log it'}
        </button>
      </div>
    </div>
  )
}