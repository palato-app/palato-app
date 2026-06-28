import { useEffect, useState } from 'react'
import { usePalateProfile } from './data/usePalateProfile'
import { getPalateProfile } from './data/getPalateProfile'
import {
  fingerprintMaturity,
  sweetSpotMaturity,
  originsMaturity,
  recommendationMaturity,
} from './data/maturity'
import { theme } from './palateTheme'
import { parseEmphasis } from './components/EditorialRead'
import { PalateFingerprint } from './components/PalateFingerprint'
import { TasteProfile } from './components/TasteProfile'
import { Origins } from './components/Origins'
import { TasteTheWorld } from './components/TasteTheWorld'
import { NewVarietals } from './components/NewVarietals'
import { WhatsNext } from './components/WhatsNext'
import { PalateStats } from './components/PalateStats'
import { useRecommendations } from './data/useRecommendations'
import { track } from '../../lib/track'

const styles = {
  container: {
    marginTop: '2rem',
    maxWidth: '600px',
  } as const,
  eyebrow: {
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '1.6px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: 0,
  } as const,
  headline: {
    fontFamily: theme.displayFont,
    fontWeight: 400,
    fontSize: '52px',
    lineHeight: 0.98,
    letterSpacing: '-0.5px',
    marginTop: '2px',
    margin: '2px 0 0',
  } as const,
  summary: {
    fontFamily: theme.displayFont,
    fontSize: '21px',
    lineHeight: 1.28,
    color: theme.ink70,
    marginTop: '12px',
  } as const,
  footnote: {
    textAlign: 'center' as const,
    fontFamily: theme.displayFont,
    fontStyle: 'italic' as const,
    fontSize: '14px',
    color: theme.ink50,
    padding: '22px 30px 6px',
    lineHeight: 1.4,
  } as const,
  previewToggle: {
    display: 'block',
    margin: '24px auto 0',
    padding: '8px 16px',
    background: 'none',
    border: `1px solid ${theme.ink15}`,
    borderRadius: '100px',
    fontFamily: theme.bodyFont,
    fontSize: '12px',
    color: theme.ink50,
    cursor: 'pointer',
  } as const,
  previewBanner: {
    textAlign: 'center' as const,
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    color: theme.ochre,
    border: `1px solid ${theme.ochre}`,
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '16px',
  } as const,
}

export function PalateDashboard({
  onSelectCoffee,
  onBrowseOrigin,
}: {
  onSelectCoffee: (coffeeId: string) => void
  onBrowseOrigin: (country: string) => void
}) {
  const real = usePalateProfile()
  const [previewMode, setPreviewMode] = useState(false)

  const mock = previewMode ? getPalateProfile('established') : null
  const profile = previewMode && mock ? mock.profile : real.profile
  const reads = previewMode && mock ? mock.reads : real.reads

  const fpMaturity = fingerprintMaturity(profile)
  const ssMaturity = sweetSpotMaturity(profile)
  const origMaturity = originsMaturity(profile)
  const recMaturity = recommendationMaturity(real.profile)
  const { recommendations, loading: recLoading } = useRecommendations(
    real.ratingCount,
    !previewMode && recMaturity === 'full',
  )

  useEffect(() => {
    track('palate_viewed', {
      ratingCount: real.ratingCount,
      previewMode,
    })
  }, [real.ratingCount, previewMode])

  if (real.loading) {
    return (
      <div style={styles.container}>
        <p style={{ opacity: 0.5, fontFamily: theme.bodyFont }}>Loading your palate...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {previewMode && (
        <div style={styles.previewBanner}>
          Previewing with sample data
          <button
            onClick={() => setPreviewMode(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.ochre,
              fontFamily: theme.bodyFont,
              fontSize: '11px',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            Back to your data
          </button>
        </div>
      )}

      <div>
        <p style={styles.eyebrow}>your palate</p>
        <h1 style={styles.headline}>
          {fpMaturity === 'full' ? (
            <>
              Bright &amp;
              <br />
              fruit-forward
            </>
          ) : (
            <>
              Taking
              <br />
              shape
            </>
          )}
        </h1>
        <p style={styles.summary}>{parseEmphasis(profile.summary)}</p>
      </div>

      <PalateStats stats={profile.stats} />

      <PalateFingerprint profile={profile} read={reads.fingerprint} maturity={fpMaturity} />

      <TasteProfile
        profile={profile}
        reads={reads}
        maturity={ssMaturity}
        ratingCount={profile.ratingCount}
      />

      <Origins
        origins={profile.origins}
        read={reads.origins}
        maturity={origMaturity}
        ratingCount={profile.ratingCount}
      />

      <TasteTheWorld origins={profile.origins} onBrowseOrigin={onBrowseOrigin} />

      <NewVarietals onSelectCoffee={onSelectCoffee} />

      <WhatsNext
        recommendations={previewMode ? null : recommendations}
        maturity={recMaturity}
        ratingCount={real.ratingCount}
        loading={recLoading}
        previewMode={previewMode}
        onSelectCoffee={onSelectCoffee}
      />

      <p style={styles.footnote}>
        Your fingerprint sharpens with every coffee. Rate to watch it move.
      </p>

      {!previewMode && (
        <button
          onClick={() => setPreviewMode(true)}
          style={styles.previewToggle}
        >
          Preview with sample data
        </button>
      )}
    </div>
  )
}
