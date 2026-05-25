import { useRef, useCallback, useMemo, useEffect } from 'react'
import type { FlavorDescriptor } from '../lib/useFlavorDescriptors'
import { buildDescriptorLookup, findMatches } from '../lib/descriptorMatcher'

type Props = {
  value: string
  onChange: (value: string) => void
  descriptors: FlavorDescriptor[]
  onMatchedDescriptors: (ids: Set<string>) => void
  placeholder?: string
}

const sharedTextStyle = {
  fontFamily: 'Geist, system-ui, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  padding: '0.85rem 1rem',
  width: '100%',
  boxSizing: 'border-box' as const,
  whiteSpace: 'pre-wrap' as const,
  wordWrap: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  letterSpacing: 'normal',
  textAlign: 'left' as const,
}

export function HighlightedTextarea({
  value,
  onChange,
  descriptors,
  onMatchedDescriptors,
  placeholder = 'What stood out? e.g. "I loved the honey, mango, and rich plum notes…"',
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const lookup = useMemo(() => buildDescriptorLookup(descriptors), [descriptors])

  const matches = useMemo(() => findMatches(value, lookup), [value, lookup])

  useEffect(() => {
    const ids = new Set(matches.map((m) => m.descriptor.id))
    onMatchedDescriptors(ids)
  }, [matches, onMatchedDescriptors])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const highlightedHtml = useMemo(() => {
    if (!value || matches.length === 0) return escapeHtml(value || '')

    const parts: string[] = []
    let lastIndex = 0
    for (const match of matches) {
      if (match.startIndex > lastIndex) {
        parts.push(escapeHtml(value.slice(lastIndex, match.startIndex)))
      }
      const color = match.descriptor.category_icon_color ?? '#1E1410'
      parts.push(
        `<span style="color:${color};font-weight:600">${escapeHtml(match.matchedText)}</span>`
      )
      lastIndex = match.endIndex
    }
    if (lastIndex < value.length) {
      parts.push(escapeHtml(value.slice(lastIndex)))
    }
    return parts.join('')
  }, [value, matches])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Backdrop with highlighted text */}
      <div
        ref={backdropRef}
        style={{
          ...sharedTextStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          color: '#1E1410',
          pointerEvents: 'none',
          overflow: 'hidden',
          minHeight: '5rem',
          border: '1px solid transparent',
        }}
        dangerouslySetInnerHTML={{
          __html: highlightedHtml || `<span style="opacity:0.4">${escapeHtml(placeholder)}</span>`,
        }}
      />
      {/* Actual textarea — transparent text, visible caret */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder=""
        style={{
          ...sharedTextStyle,
          position: 'relative',
          background: 'transparent',
          color: 'transparent',
          caretColor: '#1E1410',
          border: '1px solid rgba(30, 20, 16, 0.2)',
          borderRadius: '8px',
          resize: 'vertical',
          minHeight: '5rem',
          outline: 'none',
          zIndex: 1,
        }}
      />
    </div>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
