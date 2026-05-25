import { theme } from '../palateTheme'

const styles = {
  container: {
    marginTop: '2rem',
    maxWidth: '600px',
    textAlign: 'center' as const,
    padding: '2rem 0 4rem',
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
    fontSize: '42px',
    lineHeight: 1.05,
    letterSpacing: '-0.3px',
    marginTop: '8px',
    margin: '8px 0 0',
  } as const,
  body: {
    fontFamily: theme.displayFont,
    fontSize: '19px',
    lineHeight: 1.35,
    color: theme.ink70,
    marginTop: '16px',
    maxWidth: '360px',
    marginLeft: 'auto',
    marginRight: 'auto',
  } as const,
  progress: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '32px',
  } as const,
  dot: (filled: boolean) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: filled ? theme.ember : theme.ink10,
    transition: 'background 0.3s',
  }),
  progressLabel: {
    fontFamily: theme.bodyFont,
    fontSize: '12px',
    letterSpacing: '0.5px',
    color: theme.ink50,
    marginTop: '10px',
  } as const,
  cta: {
    marginTop: '36px',
    padding: '14px 28px',
    backgroundColor: theme.ember,
    color: theme.cream,
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontFamily: theme.bodyFont,
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  teaserSection: {
    marginTop: '48px',
    borderTop: `1px solid ${theme.ink08}`,
    paddingTop: '32px',
  } as const,
  teaserTitle: {
    fontFamily: theme.bodyFont,
    fontSize: '11px',
    letterSpacing: '1.4px',
    textTransform: 'uppercase' as const,
    color: theme.ink35,
    margin: 0,
  } as const,
  teaserList: {
    listStyle: 'none',
    padding: 0,
    margin: '16px 0 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as const,
  teaserItem: {
    fontFamily: theme.displayFont,
    fontSize: '17px',
    color: theme.ink50,
    lineHeight: 1.3,
  } as const,
}

type Props = {
  ratingCount: number
  onGoRate: () => void
}

export function PalateLocked({ ratingCount, onGoRate }: Props) {
  const remaining = 3 - ratingCount

  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>your palate</p>
      <h1 style={styles.headline}>
        Your palate is
        <br />
        waiting to emerge
      </h1>
      <p style={styles.body}>
        {remaining === 1
          ? 'One more coffee and your palate starts taking shape.'
          : `Rate ${remaining} more coffee${remaining === 1 ? '' : 's'} to unlock your personal taste profile.`}
      </p>

      <div style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={styles.dot(i < ratingCount)} />
        ))}
      </div>
      <p style={styles.progressLabel}>
        {ratingCount} of 3 coffees rated
      </p>

      <button onClick={onGoRate} style={styles.cta}>
        Rate a coffee
      </button>

      <div style={styles.teaserSection}>
        <p style={styles.teaserTitle}>What you'll unlock</p>
        <ul style={styles.teaserList}>
          <li style={styles.teaserItem}>Your flavor fingerprint — which notes you reach for</li>
          <li style={styles.teaserItem}>Roast and process sweet spots — where you score highest</li>
          <li style={styles.teaserItem}>Origin map — the countries your palate favors</li>
          <li style={styles.teaserItem}>Palate evolution — how your taste moves over time</li>
        </ul>
      </div>
    </div>
  )
}
