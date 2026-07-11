import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CoffeePlaceholder } from '../../components/CoffeePlaceholder'
import { useCoffee } from '../../lib/useCoffee'
import { useUserRatingForCoffee } from '../../lib/useUserRatingForCoffee'
import { EditRatingFlow } from '../rating/EditRatingFlow'
import { EditCoffeeForm } from './EditCoffeeForm'
import { BrewDetails, hasBrewDetails } from '../../components/BrewDetails'
import type { RatedCoffee } from '../../lib/useUserRatings'
import { ROAST_LABELS } from '../../lib/labels'
import { formatDate, formatElevation } from '../../lib/format'
import { useIsAdmin } from '../../lib/useIsAdmin'

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
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'start',
  } as const,
  heroMobile: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  } as const,
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'rgba(30, 20, 16, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  } as const,
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E1410',
    opacity: 0.3,
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
  } as const,
  detailsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as const,
  roasterEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#1E1410',
    opacity: 0.7,
    margin: '0 0 0.75rem',
  } as const,
  coffeeName: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
    margin: '0 0 2rem',
    fontWeight: 400,
  } as const,
  factGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem 2rem',
    marginBottom: '2.5rem',
    paddingTop: '1.75rem',
    borderTop: '1px solid rgba(30, 20, 16, 0.15)',
  } as const,
  factLabel: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.5,
    margin: '0 0 0.3rem',
  } as const,
  factValue: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: '1.15rem',
    color: '#1E1410',
    margin: 0,
    lineHeight: 1.3,
  } as const,
  userRatingBlock: {
    padding: '1.25rem 1.5rem',
    marginBottom: '2rem',
    background: 'rgba(217, 78, 31, 0.05)',
    borderLeft: '3px solid #D94E1F',
    borderRadius: '6px',
  } as const,
  userRatingHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    gap: '1rem',
  } as const,
  userRatingEyebrow: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1E1410',
    opacity: 0.65,
    margin: 0,
  } as const,
  userRatingValue: {
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic' as const,
    fontSize: '2.5rem',
    color: '#D94E1F',
    lineHeight: 1,
    margin: 0,
  } as const,
  userRatingNotes: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.95rem',
    color: '#1E1410',
    opacity: 0.85,
    lineHeight: 1.5,
    margin: '0.75rem 0 0',
  } as const,
  userRatingChips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.35rem',
    marginTop: '0.75rem',
  } as const,
  chip: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    padding: '0.25rem 0.7rem',
    borderRadius: '100px',
    border: '1px solid',
    fontWeight: 500,
  } as const,
  rateButton: {
    padding: '1rem 2rem',
    backgroundColor: '#D94E1F',
    color: '#F4EAD5',
    border: 'none',
    borderRadius: '100px',
    fontSize: '1rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer' as const,
    alignSelf: 'flex-start' as const,
  } as const,
  commerceBlock: {
    marginBottom: '1.5rem',
  } as const,
  buyButton: {
    display: 'inline-block',
    padding: '0.85rem 1.75rem',
    background: 'none',
    color: '#1E1410',
    border: '1.5px solid #1E1410',
    borderRadius: '100px',
    fontSize: '0.95rem',
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer' as const,
  } as const,
  availNote: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.8rem',
    color: '#D94E1F',
    margin: '0.6rem 0 0',
  } as const,
  freshNote: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontSize: '0.75rem',
    color: '#1E1410',
    opacity: 0.45,
    margin: '0.5rem 0 0',
  } as const,
}

type Props = {
  coffeeId: string
  onBack: () => void
  onRate: () => void
}

export function CoffeeDetail({ coffeeId, onBack, onRate }: Props) {
  const { coffee, loading, error, refetch: refetchCoffee } = useCoffee(coffeeId)
  const { rating: userRating, refetch: refetchRating } = useUserRatingForCoffee(coffeeId)
  // Catalog facts are admin-curated (Decision #064 revises #045's open-edit):
  // RLS (migration 0018) rejects non-admin updates; this just hides the door.
  const { isAdmin } = useIsAdmin()
  const [showBrewDetails, setShowBrewDetails] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingCoffee, setEditingCoffee] = useState(false)

  const handleDelete = async () => {
    if (!userRating) return
    setDeleting(true)
    await supabase.from('rating_flavor_descriptors').delete().eq('rating_id', userRating.id)
    await supabase.from('ratings').delete().eq('id', userRating.id)
    setDeleting(false)
    setConfirmDelete(false)
    refetchRating()
  }

  if (loading) return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Loading…</p>
  if (error)
    return (
      <p style={{ color: '#D94E1F', marginTop: '3rem' }}>
        Couldn't load this coffee: {error}
      </p>
    )
  if (!coffee) return <p style={{ opacity: 0.5, marginTop: '3rem' }}>Coffee not found.</p>

  const roastLabel = coffee.roaster_stated_roast_level
    ? ROAST_LABELS[coffee.roaster_stated_roast_level] ?? ''
    : ''

  const originDisplay = [coffee.origin_country, coffee.origin_region].filter(Boolean).join(', ')
  const processLabel = coffee.process
    ? coffee.process.charAt(0).toUpperCase() + coffee.process.slice(1).replace(/_/g, ' ')
    : ''
  const varietyDisplay = coffee.variety?.length ? coffee.variety.join(', ') : null
  const elevationDisplay = formatElevation(coffee.elevation_masl, coffee.elevation_masl_max)

  if (editingCoffee && isAdmin) {
    return (
      <EditCoffeeForm
        coffee={coffee}
        onCancel={() => setEditingCoffee(false)}
        onSaved={() => { setEditingCoffee(false); refetchCoffee() }}
      />
    )
  }

  if (editing && userRating) {
    const ratedCoffee: RatedCoffee = {
      ...userRating,
      coffee: {
        id: coffee.id,
        roaster_name: coffee.roaster_name,
        coffee_name: coffee.coffee_name,
        origin_country: coffee.origin_country,
        bag_image_url: coffee.bag_image_url,
        roaster_stated_roast_level: coffee.roaster_stated_roast_level,
      },
    }
    return (
      <EditRatingFlow
        rating={ratedCoffee}
        onCancel={() => setEditing(false)}
        onSaved={() => { setEditing(false); refetchRating() }}
      />
    )
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backLink}>← Back to coffees</button>

      <section className="palato-coffee-hero" style={styles.hero}>
        <div className="palato-coffee-image" style={styles.imageWrapper}>
          {coffee.bag_image_url ? (
            <img src={coffee.bag_image_url} alt={`${coffee.coffee_name} bag`} style={styles.image} />
          ) : (
            <CoffeePlaceholder coffeeId={coffee.id} />
          )}
        </div>

        <div style={styles.detailsColumn}>
          <p style={styles.roasterEyebrow}>{coffee.roaster_name}</p>
          <h2 style={styles.coffeeName}>{coffee.coffee_name}</h2>

          <div style={styles.factGrid}>
            {originDisplay && (
              <div>
                <p style={styles.factLabel}>Origin</p>
                <p style={styles.factValue}>{originDisplay}</p>
              </div>
            )}
            {processLabel && (
              <div>
                <p style={styles.factLabel}>Process</p>
                <p style={styles.factValue}>{processLabel}</p>
              </div>
            )}
            {roastLabel && (
              <div>
                <p style={styles.factLabel}>Roast</p>
                <p style={styles.factValue}>{roastLabel}</p>
              </div>
            )}
            {varietyDisplay && (
              <div>
                <p style={styles.factLabel}>Variety</p>
                <p style={styles.factValue}>{varietyDisplay}</p>
              </div>
            )}
            {elevationDisplay && (
              <div>
                <p style={styles.factLabel}>Elevation</p>
                <p style={styles.factValue}>{elevationDisplay}</p>
              </div>
            )}
            {coffee.sca_score !== null && coffee.sca_score !== undefined && (
              <div>
                <p style={styles.factLabel}>SCA score</p>
                <p style={styles.factValue}>{coffee.sca_score}</p>
              </div>
            )}
            {coffee.price_usd !== null && coffee.price_usd !== undefined && (
              <div>
                <p style={styles.factLabel}>Price</p>
                <p style={styles.factValue}>
                  ${coffee.price_usd}
                  {coffee.bag_weight_grams ? ` · ${coffee.bag_weight_grams}g` : ''}
                </p>
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setEditingCoffee(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.2rem 0',
                marginBottom: '2rem',
                fontFamily: 'Geist, system-ui, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#1E1410',
                opacity: 0.5,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                textDecoration: 'underline',
              }}
            >
              Edit details
            </button>
          )}

          {userRating && (
            <div style={styles.userRatingBlock}>
              <div style={styles.userRatingHeader}>
                <p style={styles.userRatingEyebrow}>
                  You rated this · {formatDate(userRating.created_at)}
                </p>
                <p style={styles.userRatingValue}>{userRating.rating.toFixed(1)}</p>
              </div>
              {userRating.user_tasting_notes && (
                <p style={styles.userRatingNotes}>{userRating.user_tasting_notes}</p>
              )}
              {userRating.descriptors.length > 0 && (
                <div style={styles.userRatingChips}>
                  {userRating.descriptors.map((d) => {
                    const iconColor = d.category_icon_color ?? '#1E1410'
                    const tintColor = d.category_pill_tint ?? 'rgba(30, 20, 16, 0.06)'
                    return (
                      <span
                        key={d.id}
                        style={{
                          ...styles.chip,
                          background: tintColor,
                          color: iconColor,
                          borderColor: `${iconColor}40`,
                        }}
                      >
                        {d.descriptor}
                      </span>
                    )
                  })}
                </div>
              )}
              {hasBrewDetails(userRating) && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(30, 20, 16, 0.1)' }}>
                  <button
                    onClick={() => setShowBrewDetails(!showBrewDetails)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.2rem 0',
                      fontFamily: 'Geist, system-ui, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#1E1410',
                      opacity: 0.5,
                      cursor: 'pointer',
                    }}
                  >
                    {showBrewDetails ? '− Hide brew details' : '+ Brew details'}
                  </button>
                  {showBrewDetails && <BrewDetails data={userRating} />}
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(30, 20, 16, 0.1)',
              }}>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.2rem 0',
                    fontFamily: 'Geist, system-ui, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#1E1410',
                    opacity: 0.5,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.2rem 0',
                      fontFamily: 'Geist, system-ui, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#D94E1F',
                      opacity: 0.7,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'Geist, system-ui, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#1E1410',
                      opacity: 0.7,
                    }}>
                      Delete this rating?
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        background: '#D94E1F',
                        color: '#F4EAD5',
                        border: 'none',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '100px',
                        fontFamily: 'Geist, system-ui, sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        opacity: deleting ? 0.5 : 1,
                      }}
                    >
                      {deleting ? 'Deleting…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.2rem 0',
                        fontFamily: 'Geist, system-ui, sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#1E1410',
                        opacity: 0.5,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {(coffee.purchase_url || coffee.price_usd != null) && (
            <div style={styles.commerceBlock}>
              {coffee.purchase_url && (
                <a
                  href={coffee.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.buyButton}
                >
                  Buy from {coffee.retailer_name || coffee.roaster_name} ↗
                </a>
              )}
              {coffee.purchase_availability === 'no' && (
                <p style={styles.availNote}>Listed as out of stock when last checked.</p>
              )}
              {coffee.web_augmented_at && (
                <p style={styles.freshNote}>
                  Checked {formatDate(coffee.web_augmented_at)} — confirm availability on the roaster's site.
                </p>
              )}
            </div>
          )}

          <button onClick={onRate} style={styles.rateButton}>
            {userRating ? 'Rate it again' : 'Rate this coffee'}
          </button>
        </div>
      </section>
    </div>
  )
}