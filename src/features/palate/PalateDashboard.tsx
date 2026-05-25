import { useEffect } from 'react'
import { getPalateProfile } from './data/getPalateProfile'
import { fingerprintMaturity } from './data/maturity'
import { theme } from './palateTheme'
import { parseEmphasis } from './components/EditorialRead'
import { PalateFingerprint } from './components/PalateFingerprint'
import { RoastSweetSpot } from './components/RoastSweetSpot'
import { ProcessSweetSpot } from './components/ProcessSweetSpot'
import { Origins } from './components/Origins'
import { PalateEvolution } from './components/PalateEvolution'
import { WhatsNext } from './components/WhatsNext'
import { PalateStats } from './components/PalateStats'
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
}

export function PalateDashboard() {
  // TODO(jesse): remove variant param when real aggregation lands
  const { profile, reads } = getPalateProfile()

  const maturity = fingerprintMaturity(profile)

  useEffect(() => {
    track('palate_viewed', {
      ratingCount: profile.ratingCount,
      maturityState: maturity,
    })
  }, [profile.ratingCount, maturity])

  return (
    <div style={styles.container}>
      {/* Header + summary */}
      <div>
        <p style={styles.eyebrow}>your palate</p>
        {/*
          The headline comes from the profile summary's first phrase.
          For mock data we derive a short headline from the profile state.
          TODO(jesse): when Claude-generated copy lands, summary and headline
          become two separate fields from the data layer.
        */}
        <h1 style={styles.headline}>
          {maturity === 'full' ? (
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

      {/* Stats strip — positioned early so the coffees count carries the number */}
      <PalateStats stats={profile.stats} />

      {/* HERO: Palate fingerprint */}
      <PalateFingerprint profile={profile} read={reads.fingerprint} />

      {/* Sweet spots */}
      <RoastSweetSpot
        buckets={profile.roastSweetSpot}
        read={reads.roast}
      />
      <ProcessSweetSpot
        buckets={profile.processSweetSpot}
        read={reads.process}
      />

      {/* Origins */}
      <Origins origins={profile.origins} read={reads.origins} />

      {/* Evolution */}
      <PalateEvolution profile={profile} read={reads.evolution} />

      {/* Recommendation */}
      <WhatsNext profile={profile} />

      {/* Closing line */}
      <p style={styles.footnote}>
        Your fingerprint sharpens with every coffee. Rate to watch it move.
      </p>
    </div>
  )
}
