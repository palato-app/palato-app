import { theme } from '../palateTheme'

const styles = {
  container: {
    marginTop: '12px',
    border: `1px dashed ${theme.ink15}`,
    borderRadius: '12px',
    padding: '22px 16px',
    textAlign: 'center' as const,
  } as const,
  title: {
    fontFamily: theme.displayFont,
    fontSize: '18px',
    color: theme.ink70,
    margin: 0,
  } as const,
  sub: {
    fontSize: '12px',
    color: theme.ink50,
    marginTop: '6px',
    lineHeight: 1.5,
  } as const,
}

type Props = {
  remaining: number
  description: string
}

export function LockedTeaser({ remaining, description }: Props) {
  return (
    <div style={styles.container}>
      <p style={styles.title}>{description}</p>
      <p style={styles.sub}>
        {remaining === 1
          ? '1 more coffee to unlock'
          : `${remaining} more coffees to unlock`}
      </p>
    </div>
  )
}
