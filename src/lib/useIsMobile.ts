import { useEffect, useState } from 'react'

/**
 * True when the viewport is at/below the mobile breakpoint. Backed by
 * matchMedia so it tracks resizes/orientation changes. Initial value is read
 * synchronously at mount (correct on first paint); the effect only subscribes,
 * so there's no setState-in-render or setState-in-effect-body.
 */
export function useIsMobile(breakpoint = 600): boolean {
  const query = `(max-width: ${breakpoint}px)`
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return isMobile
}
