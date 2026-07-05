import type { ReactNode } from 'react'
import { theme } from '../../../lib/theme'

/**
 * Parses *emphasis* markers in text into styled spans.
 * Used by EditorialRead and anywhere the "talking chart" copy renders.
 */
export function parseEmphasis(text: string): ReactNode[] {
  if (!text) return []
  const parts = text.split(/\*(.*?)\*/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <em
          key={i}
          style={{ color: theme.ember, fontStyle: 'italic' }}
        >
          {part}
        </em>
      )
    }
    return part ? <span key={i}>{part}</span> : null
  })
}

const styles = {
  read: {
    fontFamily: theme.displayFont,
    fontSize: '18px',
    lineHeight: 1.32,
    color: theme.espresso,
    marginTop: '12px',
    margin: '12px 0 0',
  } as const,
}

type Props = {
  text: string
}

/** The one-line "talking chart" caption. Renders emphasis in Ember italic. */
export function EditorialRead({ text }: Props) {
  if (!text) return null
  return <p style={styles.read}>{parseEmphasis(text)}</p>
}
