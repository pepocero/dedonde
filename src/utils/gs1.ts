import { normalizeBarcode } from './barcode.ts'

export type GS1PrefixWarning = {
  prefix: '611'
  assignedBy: 'GS1 Marruecos'
  flag: '🇲🇦'
}

export type Gs1PrefixAssignment = {
  prefix: string
  countryName: string
  assignedBy: string
  iso: string
}

type Gs1CountryRange = {
  from: number
  to: number
  countryName: string
  iso: string | null
}

const GS1_COUNTRY_RANGES: Gs1CountryRange[] = [
  { from: 0, to: 19, countryName: 'Estados Unidos', iso: 'US' },
  { from: 30, to: 39, countryName: 'Estados Unidos', iso: 'US' },
  { from: 60, to: 139, countryName: 'Estados Unidos', iso: 'US' },
  { from: 300, to: 379, countryName: 'Francia', iso: 'FR' },
  { from: 380, to: 380, countryName: 'Bulgaria', iso: 'BG' },
  { from: 383, to: 383, countryName: 'Eslovenia', iso: 'SI' },
  { from: 385, to: 385, countryName: 'Croacia', iso: 'HR' },
  { from: 387, to: 387, countryName: 'Bosnia y Herzegovina', iso: 'BA' },
  { from: 389, to: 389, countryName: 'Montenegro', iso: 'ME' },
  { from: 400, to: 440, countryName: 'Alemania', iso: 'DE' },
  { from: 450, to: 459, countryName: 'Japón', iso: 'JP' },
  { from: 460, to: 469, countryName: 'Rusia', iso: 'RU' },
  { from: 470, to: 470, countryName: 'Kirguistán', iso: 'KG' },
  { from: 471, to: 471, countryName: 'Taiwán', iso: 'TW' },
  { from: 474, to: 474, countryName: 'Estonia', iso: 'EE' },
  { from: 475, to: 475, countryName: 'Letonia', iso: 'LV' },
  { from: 476, to: 476, countryName: 'Azerbaiyán', iso: 'AZ' },
  { from: 477, to: 477, countryName: 'Lituania', iso: 'LT' },
  { from: 478, to: 478, countryName: 'Uzbekistán', iso: 'UZ' },
  { from: 479, to: 479, countryName: 'Sri Lanka', iso: 'LK' },
  { from: 480, to: 480, countryName: 'Filipinas', iso: 'PH' },
  { from: 481, to: 481, countryName: 'Bielorrusia', iso: 'BY' },
  { from: 482, to: 482, countryName: 'Ucrania', iso: 'UA' },
  { from: 483, to: 483, countryName: 'Turkmenistán', iso: 'TM' },
  { from: 484, to: 484, countryName: 'Moldavia', iso: 'MD' },
  { from: 485, to: 485, countryName: 'Armenia', iso: 'AM' },
  { from: 486, to: 486, countryName: 'Georgia', iso: 'GE' },
  { from: 487, to: 487, countryName: 'Kazajistán', iso: 'KZ' },
  { from: 488, to: 488, countryName: 'Tayikistán', iso: 'TJ' },
  { from: 489, to: 489, countryName: 'Hong Kong', iso: 'HK' },
  { from: 490, to: 499, countryName: 'Japón', iso: 'JP' },
  { from: 500, to: 509, countryName: 'Reino Unido', iso: 'GB' },
  { from: 520, to: 521, countryName: 'Grecia', iso: 'GR' },
  { from: 528, to: 528, countryName: 'Líbano', iso: 'LB' },
  { from: 529, to: 529, countryName: 'Chipre', iso: 'CY' },
  { from: 530, to: 530, countryName: 'Albania', iso: 'AL' },
  { from: 531, to: 531, countryName: 'Macedonia del Norte', iso: 'MK' },
  { from: 535, to: 535, countryName: 'Malta', iso: 'MT' },
  { from: 539, to: 539, countryName: 'Irlanda', iso: 'IE' },
  { from: 540, to: 549, countryName: 'Bélgica y Luxemburgo', iso: 'BE' },
  { from: 560, to: 560, countryName: 'Portugal', iso: 'PT' },
  { from: 569, to: 569, countryName: 'Islandia', iso: 'IS' },
  { from: 570, to: 579, countryName: 'Dinamarca', iso: 'DK' },
  { from: 590, to: 590, countryName: 'Polonia', iso: 'PL' },
  { from: 594, to: 594, countryName: 'Rumanía', iso: 'RO' },
  { from: 599, to: 599, countryName: 'Hungría', iso: 'HU' },
  { from: 600, to: 601, countryName: 'Sudáfrica', iso: 'ZA' },
  { from: 603, to: 603, countryName: 'Ghana', iso: 'GH' },
  { from: 604, to: 604, countryName: 'Senegal', iso: 'SN' },
  { from: 608, to: 608, countryName: 'Baréin', iso: 'BH' },
  { from: 609, to: 609, countryName: 'Mauricio', iso: 'MU' },
  { from: 611, to: 611, countryName: 'Marruecos', iso: 'MA' },
  { from: 613, to: 613, countryName: 'Argelia', iso: 'DZ' },
  { from: 615, to: 615, countryName: 'Nigeria', iso: 'NG' },
  { from: 616, to: 616, countryName: 'Kenia', iso: 'KE' },
  { from: 617, to: 617, countryName: 'Camerún', iso: 'CM' },
  { from: 618, to: 618, countryName: 'Costa de Marfil', iso: 'CI' },
  { from: 619, to: 619, countryName: 'Túnez', iso: 'TN' },
  { from: 620, to: 620, countryName: 'Tanzania', iso: 'TZ' },
  { from: 621, to: 621, countryName: 'Siria', iso: 'SY' },
  { from: 622, to: 622, countryName: 'Egipto', iso: 'EG' },
  { from: 623, to: 623, countryName: 'Brunéi', iso: 'BN' },
  { from: 624, to: 624, countryName: 'Libia', iso: 'LY' },
  { from: 625, to: 625, countryName: 'Jordania', iso: 'JO' },
  { from: 626, to: 626, countryName: 'Irán', iso: 'IR' },
  { from: 627, to: 627, countryName: 'Kuwait', iso: 'KW' },
  { from: 628, to: 628, countryName: 'Arabia Saudí', iso: 'SA' },
  { from: 629, to: 629, countryName: 'Emiratos Árabes Unidos', iso: 'AE' },
  { from: 630, to: 630, countryName: 'Catar', iso: 'QA' },
  { from: 631, to: 631, countryName: 'Namibia', iso: 'NA' },
  { from: 640, to: 649, countryName: 'Finlandia', iso: 'FI' },
  { from: 680, to: 681, countryName: 'China', iso: 'CN' },
  { from: 690, to: 699, countryName: 'China', iso: 'CN' },
  { from: 700, to: 709, countryName: 'Noruega', iso: 'NO' },
  { from: 729, to: 729, countryName: 'Israel', iso: 'IL' },
  { from: 730, to: 739, countryName: 'Suecia', iso: 'SE' },
  { from: 740, to: 740, countryName: 'Guatemala', iso: 'GT' },
  { from: 741, to: 741, countryName: 'El Salvador', iso: 'SV' },
  { from: 742, to: 742, countryName: 'Honduras', iso: 'HN' },
  { from: 743, to: 743, countryName: 'Nicaragua', iso: 'NI' },
  { from: 744, to: 744, countryName: 'Costa Rica', iso: 'CR' },
  { from: 745, to: 745, countryName: 'Panamá', iso: 'PA' },
  { from: 746, to: 746, countryName: 'República Dominicana', iso: 'DO' },
  { from: 750, to: 750, countryName: 'México', iso: 'MX' },
  { from: 754, to: 755, countryName: 'Canadá', iso: 'CA' },
  { from: 759, to: 759, countryName: 'Venezuela', iso: 'VE' },
  { from: 760, to: 769, countryName: 'Suiza', iso: 'CH' },
  { from: 770, to: 771, countryName: 'Colombia', iso: 'CO' },
  { from: 773, to: 773, countryName: 'Uruguay', iso: 'UY' },
  { from: 775, to: 775, countryName: 'Perú', iso: 'PE' },
  { from: 777, to: 777, countryName: 'Bolivia', iso: 'BO' },
  { from: 778, to: 779, countryName: 'Argentina', iso: 'AR' },
  { from: 780, to: 780, countryName: 'Chile', iso: 'CL' },
  { from: 784, to: 784, countryName: 'Paraguay', iso: 'PY' },
  { from: 786, to: 786, countryName: 'Ecuador', iso: 'EC' },
  { from: 789, to: 790, countryName: 'Brasil', iso: 'BR' },
  { from: 800, to: 839, countryName: 'Italia', iso: 'IT' },
  { from: 840, to: 849, countryName: 'España', iso: 'ES' },
  { from: 850, to: 850, countryName: 'Cuba', iso: 'CU' },
  { from: 858, to: 858, countryName: 'Eslovaquia', iso: 'SK' },
  { from: 859, to: 859, countryName: 'Chequia', iso: 'CZ' },
  { from: 860, to: 860, countryName: 'Serbia', iso: 'RS' },
  { from: 865, to: 865, countryName: 'Mongolia', iso: 'MN' },
  { from: 867, to: 867, countryName: 'Corea del Norte', iso: 'KP' },
  { from: 868, to: 869, countryName: 'Turquía', iso: 'TR' },
  { from: 870, to: 879, countryName: 'Países Bajos', iso: 'NL' },
  { from: 880, to: 880, countryName: 'Corea del Sur', iso: 'KR' },
  { from: 883, to: 883, countryName: 'Myanmar', iso: 'MM' },
  { from: 884, to: 884, countryName: 'Camboya', iso: 'KH' },
  { from: 885, to: 885, countryName: 'Tailandia', iso: 'TH' },
  { from: 888, to: 888, countryName: 'Singapur', iso: 'SG' },
  { from: 890, to: 890, countryName: 'India', iso: 'IN' },
  { from: 893, to: 893, countryName: 'Vietnam', iso: 'VN' },
  { from: 896, to: 896, countryName: 'Pakistán', iso: 'PK' },
  { from: 899, to: 899, countryName: 'Indonesia', iso: 'ID' },
  { from: 900, to: 919, countryName: 'Austria', iso: 'AT' },
  { from: 930, to: 939, countryName: 'Australia', iso: 'AU' },
  { from: 940, to: 949, countryName: 'Nueva Zelanda', iso: 'NZ' },
  { from: 955, to: 955, countryName: 'Malasia', iso: 'MY' },
  { from: 958, to: 958, countryName: 'Macao', iso: 'MO' },
]

export function hasGs1MoroccoPrefix(ean: unknown): boolean {
  return normalizeBarcode(ean).startsWith('611')
}

export function getGS1PrefixWarning(barcode: unknown): GS1PrefixWarning | null {
  if (!hasGs1MoroccoPrefix(barcode)) {
    return null
  }

  return {
    prefix: '611',
    assignedBy: 'GS1 Marruecos',
    flag: '🇲🇦',
  }
}

export function getGs1PrefixAssignment(barcode: unknown): Gs1PrefixAssignment | null {
  const prefix = gs1PrefixFromBarcode(barcode)
  if (!prefix) {
    return null
  }

  const prefixNumber = Number(prefix)
  const match = GS1_COUNTRY_RANGES.find((range) => prefixNumber >= range.from && prefixNumber <= range.to)
  if (!match?.iso) {
    return null
  }

  return {
    prefix,
    countryName: match.countryName,
    assignedBy: `GS1 ${match.countryName}`,
    iso: match.iso,
  }
}

function gs1PrefixFromBarcode(barcode: unknown): string | null {
  const digits = normalizeBarcode(barcode)
  let gtin13 = digits

  if (digits.length === 12) {
    gtin13 = `0${digits}`
  } else if (digits.length === 14) {
    gtin13 = digits.slice(1)
  } else if (digits.length !== 13) {
    return null
  }

  return gtin13.slice(0, 3)
}
