import type { ProductOrigin } from '../utils/mapProduct.ts'

type OriginBadgeProps = {
  origin: ProductOrigin
}

function originCopy(origin: ProductOrigin) {
  if (origin.kind === 'known') {
    const place = origin.countries[0]
    return {
      icon: place.flag,
      title: `Origen: ${place.name}`,
      detail: null as string | null,
    }
  }

  if (origin.kind === 'multiple') {
    return {
      icon: '🌍',
      title: 'Origen: varios países',
      detail: origin.countries.map((place) => `${place.flag} ${place.name}`).join(' · '),
    }
  }

  return {
    icon: '❓',
    title: 'Origen desconocido',
    detail: 'Open Food Facts no indica un país de origen claro.',
  }
}

export default function OriginBadge({ origin }: OriginBadgeProps) {
  const copy = originCopy(origin)

  return (
    <section className={`origin-badge origin-badge-${origin.kind}`} aria-label="Origen del producto">
      <span className="origin-flag" aria-hidden="true">
        {copy.icon}
      </span>
      <div>
        <p className="origin-title">{copy.title}</p>
        {copy.detail && copy.detail !== copy.title ? <p className="origin-detail">{copy.detail}</p> : null}
      </div>
    </section>
  )
}
