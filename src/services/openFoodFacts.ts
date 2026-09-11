import { barcodeLookupCandidates, normalizeBarcode } from '../utils/barcode.ts'
import { mapOpenFoodFactsProduct, type MappedProduct, type OffProduct } from '../utils/mapProduct.ts'
import { getCachedLookup, setCachedLookup } from './productCache.ts'

const API_BASE = 'https://world.openfoodfacts.org/api/v3/product'
const REQUEST_TIMEOUT_MS = 12000

const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_es',
  'generic_name',
  'generic_name_es',
  'brands',
  'image_front_url',
  'image_front_small_url',
  'image_url',
  'origins',
  'origins_tags',
  'origins_en',
  'origin',
  'origin_es',
  'origin_en',
  'manufacturing_places',
  'manufacturing_places_tags',
  'production_places',
  'production_places_tags',
  'packaging_places',
  'packaging_places_tags',
  'manufacturers',
  'manufacturers_tags',
  'countries',
  'countries_tags',
  'countries_en',
].join(',')

export type ErrorKind = 'timeout' | 'network' | 'unavailable'

export type ProductFetchResult =
  | { status: 'found'; product: MappedProduct; fromCache?: boolean }
  | { status: 'not_found'; product: null; fromCache?: boolean }

type OffApiResponse = {
  status?: string
  result?: { id?: string }
  product?: OffProduct
}

export class OpenFoodFactsError extends Error {
  kind: ErrorKind

  constructor(kind: ErrorKind, message: string) {
    super(message)
    this.name = 'OpenFoodFactsError'
    this.kind = kind
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

function buildUrl(barcode: string): string {
  const params = new URLSearchParams({
    fields: PRODUCT_FIELDS,
    lc: 'es',
    cc: 'es',
    tags_lc: 'es',
  })

  return `${API_BASE}/${encodeURIComponent(barcode)}?${params.toString()}`
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', onAbort, { once: true })
    }
  }

  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      if (signal?.aborted) {
        throw error
      }
      throw new OpenFoodFactsError('timeout', 'La búsqueda está tardando demasiado.')
    }
    throw new OpenFoodFactsError('network', 'No hemos podido conectar.')
  } finally {
    window.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }
}

function classifyHttpError(response: Response): 'not_found' {
  if (response.status === 404) {
    return 'not_found'
  }
  if (response.status === 429 || response.status >= 500) {
    throw new OpenFoodFactsError('unavailable', 'El servicio no está disponible en este momento.')
  }
  throw new OpenFoodFactsError('unavailable', 'El servicio no está disponible en este momento.')
}

async function requestProduct(
  barcode: string,
  signal?: AbortSignal,
): Promise<ProductFetchResult | 'not_found'> {
  const response = await fetchWithTimeout(buildUrl(barcode), signal)

  if (!response.ok) {
    return classifyHttpError(response)
  }

  let data: OffApiResponse
  try {
    data = (await response.json()) as OffApiResponse
  } catch {
    throw new OpenFoodFactsError('unavailable', 'El servicio no está disponible en este momento.')
  }

  const resultId = data?.result?.id
  if (data?.status === 'success' && resultId === 'product_found' && data.product) {
    return {
      status: 'found',
      product: mapOpenFoodFactsProduct(data.product, barcode),
    }
  }

  if (resultId === 'product_not_found' || data?.status === 'failure') {
    return { status: 'not_found', product: null }
  }

  if (data?.product) {
    return {
      status: 'found',
      product: mapOpenFoodFactsProduct(data.product, barcode),
    }
  }

  return { status: 'not_found', product: null }
}

type FetchOptions = {
  signal?: AbortSignal
  skipCache?: boolean
}

export async function fetchProductByBarcode(
  rawBarcode: string,
  { signal, skipCache = false }: FetchOptions = {},
): Promise<ProductFetchResult> {
  const barcode = normalizeBarcode(rawBarcode)
  const candidates = barcodeLookupCandidates(barcode)

  if (!skipCache) {
    for (const candidate of candidates) {
      const cached = getCachedLookup(candidate)
      if (cached) {
        return cached
      }
    }
  }

  let lastError: unknown = null

  for (const candidate of candidates) {
    try {
      const result = await requestProduct(candidate, signal)
      if (result === 'not_found' || result.status === 'not_found') {
        continue
      }
      if (result.status === 'found') {
        setCachedLookup(candidate, 'found', result.product)
        return result
      }
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  setCachedLookup(barcode, 'not_found', null)
  return { status: 'not_found', product: null }
}
