import { AlertIcon } from './Icons.tsx'
import type { Gs1PrefixAssignment } from '../utils/gs1.ts'

function countryFlagUrl(iso: string, width: number): string {
  return `https://flagcdn.com/w${width}/${iso.toLowerCase()}.png`
}

export default function Gs1CountryHint({ assignment }: { assignment: Gs1PrefixAssignment }) {
  const flagUrl = countryFlagUrl(assignment.iso, 80)
  const flagUrl2x = countryFlagUrl(assignment.iso, 160)

  return (
    <section className="gs1-notice gs1-notice-prefix" aria-label="Prefijo GS1 del código de barras">
      <img
        className="gs1-notice-flag-image"
        src={flagUrl}
        srcSet={`${flagUrl} 1x, ${flagUrl2x} 2x`}
        width={56}
        height={42}
        alt={`Bandera de ${assignment.countryName}`}
      />
      <div>
        <p className="gs1-notice-label">Según el prefijo GS1: {assignment.prefix}</p>
        <p className="gs1-notice-title">El código fue asignado por {assignment.assignedBy}.</p>
        <p className="gs1-notice-caution">
          <AlertIcon size={18} />
          Esto no asegura que el producto se haya fabricado en {assignment.countryName} ni que su país de origen sea{' '}
          {assignment.countryName}.
        </p>
      </div>
    </section>
  )
}
