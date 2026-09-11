import type { MappedProduct } from '../utils/mapProduct.ts'

const CACHE_VERSION = 1
const PREFIX = `dedonde:v${CACHE_VERSION}:product:`
const FOUND_TTL_MS = 7 * 24 * 60 * 60 * 1000
const NOT_FOUND_TTL_MS = 24 * 60 * 60 * 1000

export type LookupCacheStatus = 'found' | 'not_found'

export type CachedLookup =
  | { status: 'found'; product: MappedProduct; fromCache: true }
  | { status: 'not_found'; product: null; fromCache: true }

type CacheEntry = {
  status: LookupCacheStatus
  product: MappedProduct | null
  storedAt: number
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function cacheKey(barcode: string): string {
  return `${PREFIX}${barcode}`
}

function isCacheEntry(value: unknown): value is CacheEntry {
  if (!value || typeof value !== 'object') {
    return false
  }

  const entry = value as CacheEntry
  return (entry.status === 'found' || entry.status === 'not_found') && typeof entry.storedAt === 'number'
}

function readEntry(barcode: string): CacheEntry | null {
  const store = storage()
  if (!store) {
    return null
  }

  try {
    const raw = store.getItem(cacheKey(barcode))
    if (!raw) {
      return null
    }

    const entry: unknown = JSON.parse(raw)
    if (!isCacheEntry(entry)) {
      store.removeItem(cacheKey(barcode))
      return null
    }

    const ttl = entry.status === 'found' ? FOUND_TTL_MS : NOT_FOUND_TTL_MS
    if (Date.now() - entry.storedAt > ttl) {
      store.removeItem(cacheKey(barcode))
      return null
    }

    return entry
  } catch {
    return null
  }
}

export function getCachedLookup(barcode: string): CachedLookup | null {
  const entry = readEntry(barcode)
  if (!entry) {
    return null
  }

  if (entry.status === 'found' && entry.product) {
    return {
      status: 'found',
      product: entry.product,
      fromCache: true,
    }
  }

  return {
    status: 'not_found',
    product: null,
    fromCache: true,
  }
}

export function setCachedLookup(
  barcode: string,
  status: LookupCacheStatus,
  product: MappedProduct | null = null,
): void {
  const store = storage()
  if (!store) {
    return
  }

  try {
    const entry: CacheEntry = {
      status,
      product,
      storedAt: Date.now(),
    }
    store.setItem(cacheKey(barcode), JSON.stringify(entry))
  } catch {
    // localStorage puede estar lleno o bloqueado; la app sigue funcionando sin caché.
  }
}
