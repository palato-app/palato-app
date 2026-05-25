import type { ReactNode } from 'react'
import { theme } from '../palateTheme'

const styles = {
  card: {
    background: theme.cream,
    border: `1px solid ${theme.ink15}`,
    borderRadius: '16px',
    padding: '18px 18px 16px',
    marginTop: '14px',
  } as const,
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const,
  title: {
    fontFamily: theme.bodyFont,
    fontSize: '12px',
    letterSpacing: '1.4px',
    textTransform: 'uppercase' as const,
    color: theme.ink50,
    margin: 0,
  } as const,
  tag: {
    fontSize: '10px',
    letterSpacing: '0.6px',
    color: theme.ochre,
    border: `1px solid ${theme.ochre}`,
    borderRadius: '999px',
    padding: '2px 8px',
  } as const,
}

type Props = {
  title: string
  tag?: string
  children: ReactNode
}

/** Shared card shell for every Palate module. */
export function ModuleCard({ title, tag, children }: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.titleRow}>
        <p style={styles.title}>{title}</p>
        {tag && <span style={styles.tag}>{tag}</span>}
      </div>
      {children}
    </div>
  )
}
