const EAN_LENGTHS = new Set([8, 12, 13, 14])

export function normalizeBarcode(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function isNumericBarcode(value: unknown): boolean {
  return /^\d+$/.test(String(value ?? '').trim())
}

export function hasValidChecksum(code: string): boolean {
  const digits = normalizeBarcode(code).split('').map(Number)
  if (!EAN_LENGTHS.has(digits.length)) {
    return false
  }

  const checkDigit = digits.pop()
  if (checkDigit === undefined) {
    return false
  }

  const sum = digits.reduce((total, digit, index) => {
    const fromRight = digits.length - index
    const multiplier = fromRight % 2 === 0 ? 1 : 3
    return total + digit * multiplier
  }, 0)

  return (10 - (sum % 10)) % 10 === checkDigit
}

export function isValidBarcode(value: unknown): boolean {
  const code = normalizeBarcode(value)
  if (!EAN_LENGTHS.has(code.length)) {
    return false
  }
  return hasValidChecksum(code)
}

export function expandUpcAToEan13(code: string): string | null {
  const normalized = normalizeBarcode(code)
  if (normalized.length === 12 && hasValidChecksum(normalized)) {
    return `0${normalized}`
  }
  return null
}

export function shortenEan13ToUpcA(code: string): string | null {
  const normalized = normalizeBarcode(code)
  if (normalized.length === 13 && normalized.startsWith('0') && hasValidChecksum(normalized)) {
    return normalized.slice(1)
  }
  return null
}

export function barcodeLookupCandidates(value: unknown): string[] {
  const code = normalizeBarcode(value)
  const candidates = [code]
  const asEan13 = expandUpcAToEan13(code)
  const asUpcA = shortenEan13ToUpcA(code)

  if (asEan13 && !candidates.includes(asEan13)) {
    candidates.push(asEan13)
  }
  if (asUpcA && !candidates.includes(asUpcA)) {
    candidates.push(asUpcA)
  }

  return candidates
}
