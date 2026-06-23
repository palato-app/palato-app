import type { CSSProperties } from 'react'
import { coffeePlaceholder } from '../lib/coffeeImage'

/**
 * A random-but-stable "imagine a nice coffee bag" tile for coffees with no bag
 * photo. Fills its container by default (drop it inside an existing sized image
 * wrapper); pass `style` to give it fixed dimensions when it replaces a sized box.
 */
export function CoffeePlaceholder({
  coffeeId,
  artScale = 0.82,
  style,
}: {
  coffeeId: string
  artScale?: number
  style?: CSSProperties
}) {
  const { art, background } = coffeePlaceholder(coffeeId)
  return (
    <div
      style={{
        // defaults: fill the container. Caller's `style` may override sizing…
        width: '100%',
        height: '100%',
        ...style,
        // …but the random background + centering always win (a passed-in style's
        // own background must not clobber the placeholder colour).
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={art}
        alt=""
        loading="lazy"
        style={{ width: `${artScale * 100}%`, height: `${artScale * 100}%`, objectFit: 'contain' }}
      />
    </div>
  )
}
