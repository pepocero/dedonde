import {
  asStringArray,
  cleanText,
  formatPlaceText,
  parsePlaceTag,
  parsePlacesFromText,
  type Place,
} from './countries.ts'

export type OffProduct = {
  code?: string
  product_name?: string
  product_name_es?: string
  generic_name?: string
  generic_name_es?: string
  brands?: string
  image_front_url?: string
  image_front_small_url?: string
  image_url?: string
  origins?: string
  origins_tags?: unknown
  origins_en?: string
  origin?: string
  origin_es?: string
  origin_en?: string
  manufacturing_places?: string
  manufacturing_places_tags?: unknown
  production_places?: string
  production_places_tags?: unknown
  packaging_places?: string
  packaging_places_tags?: unknown
  manufacturers?: string
  manufacturers_tags?: unknown
  countries?: string
  countries_tags?: unknown
  countries_en?: string
}

export type OriginKind = 'known' | 'multiple' | 'unknown'

export type ProductOrigin = {
  kind: OriginKind
  countries: Place[]
  rawText: string | null
}

export type MappedProduct = {
  barcode: string | null
  name: string | null
  brand: string | null
  imageUrl: string | null
  origin: ProductOrigin
  mixedOriginText: string | null
  manufacturingPlaces: string | null
  productionPlaces: string | null
  packagingPlaces: string | null
  manufacturer: string | null
  countriesSold: Place[]
  hasStructuredOrigin: boolean
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const cleaned = cleanText(value)
    if (cleaned) {
      return cleaned
    }
  }
  return null
}

function uniquePlaces(places: Array<Place | null>): Place[] {
  const seen = new Set<string>()
  const unique: Place[] = []

  for (const place of places) {
    if (!place || seen.has(place.id)) {
      continue
    }
    seen.add(place.id)
    unique.push(place)
  }

  return unique
}

function resolveOrigin(product: OffProduct): ProductOrigin {
  const fromTags = asStringArray(product.origins_tags).map(parsePlaceTag)
  const fromText = parsePlacesFromText(product.origins)
  const countries = uniquePlaces([...fromTags, ...fromText])
  const rawText = firstText(product.origins)

  if (countries.length === 1) {
    return {
      kind: 'known',
      countries,
      rawText,
    }
  }

  if (countries.length > 1) {
    return {
      kind: 'multiple',
      countries,
      rawText,
    }
  }

  return {
    kind: 'unknown',
    countries: [],
    rawText,
  }
}

function httpsUrl(value: unknown): string | null {
  const url = cleanText(value)
  if (!url) {
    return null
  }
  if (url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`
  }
  return null
}

export function mapOpenFoodFactsProduct(product: OffProduct, barcode: string): MappedProduct {
  const origin = resolveOrigin(product)
  const mixedOriginText = firstText(product.origin_es, product.origin_en, product.origin)
  const manufacturingPlaces = formatPlaceText(
    firstText(product.manufacturing_places, asStringArray(product.manufacturing_places_tags).join(', ')),
  )
  const productionPlaces = formatPlaceText(
    firstText(product.production_places, asStringArray(product.production_places_tags).join(', ')),
  )
  const packagingPlaces = formatPlaceText(
    firstText(product.packaging_places, asStringArray(product.packaging_places_tags).join(', ')),
  )
  const manufacturer = firstText(
    product.manufacturers,
    asStringArray(product.manufacturers_tags).join(', '),
  )
  const countriesSold = uniquePlaces(asStringArray(product.countries_tags).map(parsePlaceTag))
  const hasStructuredOrigin = origin.kind !== 'unknown'

  return {
    barcode: firstText(product.code, barcode),
    name: firstText(
      product.product_name_es,
      product.product_name,
      product.generic_name_es,
      product.generic_name,
    ),
    brand: firstText(product.brands),
    imageUrl: httpsUrl(product.image_front_url) || httpsUrl(product.image_url) || httpsUrl(product.image_front_small_url),
    origin,
    mixedOriginText: mixedOriginText && mixedOriginText !== origin.rawText ? mixedOriginText : null,
    manufacturingPlaces,
    productionPlaces,
    packagingPlaces,
    manufacturer,
    countriesSold,
    hasStructuredOrigin,
  }
}
