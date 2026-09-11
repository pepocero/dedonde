export type Place = {
  id: string
  name: string
  iso: string | null
  flag: string
}

type CountryDefinition = {
  name: string
  iso: string | null
  flag?: string
}

function flagFromIso(iso: string | null): string {
  if (!iso || iso.length !== 2) {
    return '🌍'
  }

  return iso
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

const COUNTRIES: Record<string, CountryDefinition> = {
  afghanistan: { name: 'Afganistán', iso: 'AF' },
  albania: { name: 'Albania', iso: 'AL' },
  algeria: { name: 'Argelia', iso: 'DZ' },
  andorra: { name: 'Andorra', iso: 'AD' },
  angola: { name: 'Angola', iso: 'AO' },
  argentina: { name: 'Argentina', iso: 'AR' },
  armenia: { name: 'Armenia', iso: 'AM' },
  australia: { name: 'Australia', iso: 'AU' },
  austria: { name: 'Austria', iso: 'AT' },
  azerbaijan: { name: 'Azerbaiyán', iso: 'AZ' },
  bangladesh: { name: 'Bangladés', iso: 'BD' },
  belarus: { name: 'Bielorrusia', iso: 'BY' },
  belgium: { name: 'Bélgica', iso: 'BE' },
  belize: { name: 'Belice', iso: 'BZ' },
  benin: { name: 'Benín', iso: 'BJ' },
  bolivia: { name: 'Bolivia', iso: 'BO' },
  'bosnia-and-herzegovina': { name: 'Bosnia y Herzegovina', iso: 'BA' },
  brazil: { name: 'Brasil', iso: 'BR' },
  bulgaria: { name: 'Bulgaria', iso: 'BG' },
  cambodia: { name: 'Camboya', iso: 'KH' },
  cameroon: { name: 'Camerún', iso: 'CM' },
  canada: { name: 'Canadá', iso: 'CA' },
  chile: { name: 'Chile', iso: 'CL' },
  china: { name: 'China', iso: 'CN' },
  colombia: { name: 'Colombia', iso: 'CO' },
  'costa-rica': { name: 'Costa Rica', iso: 'CR' },
  croatia: { name: 'Croacia', iso: 'HR' },
  cuba: { name: 'Cuba', iso: 'CU' },
  cyprus: { name: 'Chipre', iso: 'CY' },
  czechia: { name: 'Chequia', iso: 'CZ' },
  'czech-republic': { name: 'Chequia', iso: 'CZ' },
  denmark: { name: 'Dinamarca', iso: 'DK' },
  'dominican-republic': { name: 'República Dominicana', iso: 'DO' },
  ecuador: { name: 'Ecuador', iso: 'EC' },
  egypt: { name: 'Egipto', iso: 'EG' },
  'el-salvador': { name: 'El Salvador', iso: 'SV' },
  estonia: { name: 'Estonia', iso: 'EE' },
  ethiopia: { name: 'Etiopía', iso: 'ET' },
  'european-union': { name: 'Unión Europea', iso: 'EU', flag: '🇪🇺' },
  finland: { name: 'Finlandia', iso: 'FI' },
  france: { name: 'Francia', iso: 'FR' },
  germany: { name: 'Alemania', iso: 'DE' },
  ghana: { name: 'Ghana', iso: 'GH' },
  greece: { name: 'Grecia', iso: 'GR' },
  guatemala: { name: 'Guatemala', iso: 'GT' },
  honduras: { name: 'Honduras', iso: 'HN' },
  hungary: { name: 'Hungría', iso: 'HU' },
  iceland: { name: 'Islandia', iso: 'IS' },
  india: { name: 'India', iso: 'IN' },
  indonesia: { name: 'Indonesia', iso: 'ID' },
  iran: { name: 'Irán', iso: 'IR' },
  iraq: { name: 'Irak', iso: 'IQ' },
  ireland: { name: 'Irlanda', iso: 'IE' },
  israel: { name: 'Israel', iso: 'IL' },
  italy: { name: 'Italia', iso: 'IT' },
  'ivory-coast': { name: 'Costa de Marfil', iso: 'CI' },
  jamaica: { name: 'Jamaica', iso: 'JM' },
  japan: { name: 'Japón', iso: 'JP' },
  jordan: { name: 'Jordania', iso: 'JO' },
  kenya: { name: 'Kenia', iso: 'KE' },
  latvia: { name: 'Letonia', iso: 'LV' },
  lebanon: { name: 'Líbano', iso: 'LB' },
  lithuania: { name: 'Lituania', iso: 'LT' },
  luxembourg: { name: 'Luxemburgo', iso: 'LU' },
  madagascar: { name: 'Madagascar', iso: 'MG' },
  malaysia: { name: 'Malasia', iso: 'MY' },
  malta: { name: 'Malta', iso: 'MT' },
  mexico: { name: 'México', iso: 'MX' },
  moldova: { name: 'Moldavia', iso: 'MD' },
  morocco: { name: 'Marruecos', iso: 'MA' },
  mozambique: { name: 'Mozambique', iso: 'MZ' },
  netherlands: { name: 'Países Bajos', iso: 'NL' },
  'new-zealand': { name: 'Nueva Zelanda', iso: 'NZ' },
  nicaragua: { name: 'Nicaragua', iso: 'NI' },
  nigeria: { name: 'Nigeria', iso: 'NG' },
  'north-macedonia': { name: 'Macedonia del Norte', iso: 'MK' },
  norway: { name: 'Noruega', iso: 'NO' },
  pakistan: { name: 'Pakistán', iso: 'PK' },
  panama: { name: 'Panamá', iso: 'PA' },
  paraguay: { name: 'Paraguay', iso: 'PY' },
  peru: { name: 'Perú', iso: 'PE' },
  philippines: { name: 'Filipinas', iso: 'PH' },
  poland: { name: 'Polonia', iso: 'PL' },
  portugal: { name: 'Portugal', iso: 'PT' },
  romania: { name: 'Rumanía', iso: 'RO' },
  russia: { name: 'Rusia', iso: 'RU' },
  'saudi-arabia': { name: 'Arabia Saudí', iso: 'SA' },
  senegal: { name: 'Senegal', iso: 'SN' },
  serbia: { name: 'Serbia', iso: 'RS' },
  singapore: { name: 'Singapur', iso: 'SG' },
  slovakia: { name: 'Eslovaquia', iso: 'SK' },
  slovenia: { name: 'Eslovenia', iso: 'SI' },
  'south-africa': { name: 'Sudáfrica', iso: 'ZA' },
  'south-korea': { name: 'Corea del Sur', iso: 'KR' },
  spain: { name: 'España', iso: 'ES' },
  'sri-lanka': { name: 'Sri Lanka', iso: 'LK' },
  sweden: { name: 'Suecia', iso: 'SE' },
  switzerland: { name: 'Suiza', iso: 'CH' },
  taiwan: { name: 'Taiwán', iso: 'TW' },
  tanzania: { name: 'Tanzania', iso: 'TZ' },
  thailand: { name: 'Tailandia', iso: 'TH' },
  tunisia: { name: 'Túnez', iso: 'TN' },
  turkey: { name: 'Turquía', iso: 'TR' },
  ukraine: { name: 'Ucrania', iso: 'UA' },
  'united-arab-emirates': { name: 'Emiratos Árabes Unidos', iso: 'AE' },
  'united-kingdom': { name: 'Reino Unido', iso: 'GB' },
  'united-states': { name: 'Estados Unidos', iso: 'US' },
  uruguay: { name: 'Uruguay', iso: 'UY' },
  venezuela: { name: 'Venezuela', iso: 'VE' },
  vietnam: { name: 'Vietnam', iso: 'VN' },
  world: { name: 'Varios países', iso: null, flag: '🌍' },
}

const NAME_ALIASES: Record<string, string> = {
  espagne: 'spain',
  espana: 'spain',
  españa: 'spain',
  spain: 'spain',
  maroc: 'morocco',
  morocco: 'morocco',
  marruecos: 'morocco',
  portugal: 'portugal',
  france: 'france',
  francia: 'france',
  italy: 'italy',
  italia: 'italy',
  italie: 'italy',
  germany: 'germany',
  alemania: 'germany',
  allemagne: 'germany',
  deutschland: 'germany',
  netherlands: 'netherlands',
  holanda: 'netherlands',
  'paises bajos': 'netherlands',
  'países bajos': 'netherlands',
  belgium: 'belgium',
  belgica: 'belgium',
  bélgica: 'belgium',
  belgique: 'belgium',
  china: 'china',
  peru: 'peru',
  perú: 'peru',
  ecuador: 'ecuador',
  chile: 'chile',
  argentina: 'argentina',
  brazil: 'brazil',
  brasil: 'brazil',
  mexico: 'mexico',
  méxico: 'mexico',
  mexique: 'mexico',
  'united kingdom': 'united-kingdom',
  'reino unido': 'united-kingdom',
  'great britain': 'united-kingdom',
  'united states': 'united-states',
  'estados unidos': 'united-states',
  usa: 'united-states',
  poland: 'poland',
  polonia: 'poland',
  pologne: 'poland',
  turkey: 'turkey',
  turquia: 'turkey',
  turquía: 'turkey',
  turquie: 'turkey',
  tunisia: 'tunisia',
  tunez: 'tunisia',
  túnez: 'tunisia',
  tunisie: 'tunisia',
  egypt: 'egypt',
  egipto: 'egypt',
  egypte: 'egypt',
  greece: 'greece',
  grecia: 'greece',
  ireland: 'ireland',
  irlanda: 'ireland',
  switzerland: 'switzerland',
  suiza: 'switzerland',
  suisse: 'switzerland',
  austria: 'austria',
  denmark: 'denmark',
  dinamarca: 'denmark',
  sweden: 'sweden',
  suecia: 'sweden',
  norway: 'norway',
  noruega: 'norway',
  finland: 'finland',
  finlandia: 'finland',
  romania: 'romania',
  rumania: 'romania',
  rumanía: 'romania',
  colombia: 'colombia',
  india: 'india',
  thailand: 'thailand',
  tailandia: 'thailand',
  vietnam: 'vietnam',
  'south africa': 'south-africa',
  sudafrica: 'south-africa',
  'sudáfrica': 'south-africa',
  'european union': 'european-union',
  'union europea': 'european-union',
  'unión europea': 'european-union',
  'union europeenne': 'european-union',
  ue: 'european-union',
  eu: 'european-union',
}

export function placeFromCountryId(id: string): Place | null {
  const country = COUNTRIES[id]
  if (!country) {
    return null
  }

  return {
    id,
    name: country.name,
    iso: country.iso,
    flag: country.flag || flagFromIso(country.iso),
  }
}

export function parsePlaceTag(tag: unknown): Place | null {
  if (!tag) {
    return null
  }

  const value = String(tag).trim().toLowerCase()
  const withoutLang = value.replace(/^[a-z]{2}:/, '')
  const slug = withoutLang.replace(/_/g, '-')
  const known = placeFromCountryId(slug)
  if (known) {
    return known
  }

  const aliased = NAME_ALIASES[withoutLang.replace(/-/g, ' ')] || NAME_ALIASES[slug]
  if (aliased) {
    return placeFromCountryId(aliased)
  }

  if (!slug || slug === 'unknown' || slug === 'unspecified') {
    return null
  }

  return {
    id: slug,
    name: humanizeSlug(slug),
    iso: null,
    flag: '📍',
  }
}

export function parsePlacesFromText(text: unknown): Place[] {
  if (!text || typeof text !== 'string') {
    return []
  }

  const parts = text
    .split(/[,;/|]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const places: Place[] = []
  const seen = new Set<string>()

  for (const part of parts) {
    const normalized = normalizeName(part)
    const aliasId = NAME_ALIASES[normalized]
    const place = aliasId ? placeFromCountryId(aliasId) : parsePlaceTag(normalized.replace(/\s+/g, '-'))

    if (!place || seen.has(place.id)) {
      continue
    }

    seen.add(place.id)
    places.push(place)
  }

  return places
}

export function formatPlaceText(text: string | null): string | null {
  if (!text) {
    return null
  }

  const places = parsePlacesFromText(text)
  if (places.length > 0) {
    return places.map((place) => `${place.flag} ${place.name}`).join(', ')
  }

  return cleanText(text)
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.]/g, '')
    .trim()
}

export function cleanText(value: unknown): string | null {
  if (value == null) {
    return null
  }

  const text = String(value).replace(/\s+/g, ' ').trim()
  return text.length > 0 ? text : null
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}
