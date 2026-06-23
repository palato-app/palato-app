import { coffeePlaceholder } from '../lib/coffeeImage'

/**
 * Fills its container with a random-but-stable "imagine a nice coffee bag" tile,
 * for coffees with no bag photo. Drop it into an existing image container (which
 * supplies the aspect ratio / border radius).
 */
export function CoffeePlaceholder({ coffeeId, artScale = 0.82 }: { coffeeId: string; artScale?: number }) {
  const { art, background } = coffeePlaceholder(coffeeId)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
