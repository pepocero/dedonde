import type { ReactNode } from 'react'
import type { MappedProduct } from '../utils/mapProduct.ts'
import { getGS1PrefixWarning, getGs1PrefixAssignment } from '../utils/gs1.ts'
import OriginBadge from './OriginBadge.tsx'
import Gs1PrefixNotice from './Gs1PrefixNotice.tsx'
import Gs1CountryHint from './Gs1CountryHint.tsx'
import {
  AlertIcon,
  BarcodeIcon,
  CameraIcon,
  FactoryIcon,
  GlobeIcon,
  PackageIcon,
  PinIcon,
} from './Icons.tsx'
import SearchBar from './SearchBar.tsx'

type FactProps = {
  icon: ReactNode
  label: string
  value: string | null
}

type ProductResultProps = {
  product: MappedProduct
  queriedBarcode: string | null
  onScanAgain: () => void
  onManualSearch: (code: string) => void
  busy: boolean
}

function Fact({ icon, label, value }: FactProps) {
  if (!value) {
    return null
  }

  return (
    <article className="fact">
      <span className="fact-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="fact-label">{label}</p>
        <p className="fact-value">{value}</p>
      </div>
    </article>
  )
}

export default function ProductResult({
  product,
  queriedBarcode,
  onScanAgain,
  onManualSearch,
  busy,
}: ProductResultProps) {
  const soldIn =
    product.countriesSold.length > 0
      ? product.countriesSold.map((place) => `${place.flag} ${place.name}`).join(', ')
      : null
  const barcode = queriedBarcode ?? product.barcode
  const gs1Warning = getGS1PrefixWarning(barcode)
  const gs1CountryHint =
    !product.hasStructuredOrigin && !gs1Warning ? getGs1PrefixAssignment(barcode) : null

  return (
    <section className="result">
      <div className="result-card">
        {product.imageUrl ? (
          <img className="product-image" src={product.imageUrl} alt={product.name || 'Fotografía del producto'} />
        ) : (
          <div className="product-image product-image-empty">Sin fotografía</div>
        )}
        <div className="result-heading">
          <h2>{product.name || 'Producto sin nombre'}</h2>
          {product.brand ? <p className="brand">{product.brand}</p> : null}
          <p className="barcode-line">
            <BarcodeIcon size={18} />
            <span>{product.barcode}</span>
          </p>
        </div>
      </div>

      <OriginBadge origin={product.origin} />

      {gs1Warning ? <Gs1PrefixNotice warning={gs1Warning} /> : null}
      {gs1CountryHint ? <Gs1CountryHint assignment={gs1CountryHint} /> : null}

      {!product.hasStructuredOrigin ? (
        <p className="origin-warning">
          <AlertIcon size={18} />
          No tenemos información suficiente sobre el origen de este producto.
        </p>
      ) : null}

      <div className="facts">
        <Fact
          icon={<PinIcon />}
          label="Origen de los ingredientes"
          value={product.origin.kind === 'known' ? null : product.origin.rawText}
        />
        <Fact icon={<FactoryIcon />} label="Fabricado en" value={product.manufacturingPlaces} />
        <Fact
          icon={<FactoryIcon />}
          label="Elaborado en"
          value={
            product.productionPlaces && product.productionPlaces !== product.manufacturingPlaces
              ? product.productionPlaces
              : null
          }
        />
        <Fact icon={<PackageIcon />} label="Envasado en" value={product.packagingPlaces} />
        <Fact icon={<FactoryIcon />} label="Fabricante" value={product.manufacturer} />
        <Fact icon={<GlobeIcon />} label="Se vende en" value={soldIn} />
        <Fact icon={<PinIcon />} label="Texto de origen indicado en el producto" value={product.mixedOriginText} />
      </div>

      <div className="result-actions">
        <button type="button" className="button button-primary" onClick={onScanAgain} disabled={busy}>
          <CameraIcon />
          Escanear otro producto
        </button>
        <SearchBar onSearch={onManualSearch} disabled={busy} label="Introducir otro código" />
      </div>
    </section>
  )
}
