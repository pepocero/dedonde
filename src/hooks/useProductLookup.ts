import { useCallback, useRef, useState } from 'react'
import {
  fetchProductByBarcode,
  OpenFoodFactsError,
  type ErrorKind,
  type ProductFetchResult,
} from '../services/openFoodFacts.ts'
import type { MappedProduct } from '../utils/mapProduct.ts'

export type LookupStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

export type LookupResult =
  | ProductFetchResult
  | { status: 'error'; product: null; errorKind: ErrorKind }
  | { status: 'busy'; product: null }
  | { status: 'aborted'; product: null }

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useProductLookup() {
  const [status, setStatus] = useState<LookupStatus>('idle')
  const [product, setProduct] = useState<MappedProduct | null>(null)
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef(false)

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    inFlightRef.current = false
  }, [])

  const reset = useCallback(() => {
    abort()
    setStatus('idle')
    setProduct(null)
    setErrorKind(null)
  }, [abort])

  const lookup = useCallback(async (barcode: string): Promise<LookupResult> => {
    if (inFlightRef.current) {
      return { status: 'busy', product: null }
    }

    inFlightRef.current = true
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setProduct(null)
    setErrorKind(null)

    try {
      const result = await fetchProductByBarcode(barcode, { signal: controller.signal })
      if (controller.signal.aborted) {
        return { status: 'aborted', product: null }
      }

      if (result.status === 'found') {
        setProduct(result.product)
        setStatus('found')
        return result
      }

      setStatus('not_found')
      return result
    } catch (error) {
      if (isAbortError(error)) {
        return { status: 'aborted', product: null }
      }

      const kind = error instanceof OpenFoodFactsError ? error.kind : 'network'
      setErrorKind(kind)
      setStatus('error')
      return { status: 'error', errorKind: kind, product: null }
    } finally {
      inFlightRef.current = false
    }
  }, [])

  return {
    status,
    product,
    errorKind,
    lookup,
    reset,
    abort,
    isBusy: status === 'loading' || inFlightRef.current,
  }
}
