import { AlertIcon } from './Icons.tsx'
import type { GS1PrefixWarning } from '../utils/gs1.ts'

export default function Gs1PrefixNotice({ warning }: { warning: GS1PrefixWarning }) {
  return (
    <section className="gs1-notice" aria-label="Prefijo GS1 del código de barras">
      <p className="gs1-notice-label">Prefijo GS1: {warning.prefix}</p>
      <p className="gs1-notice-title">
        <span aria-hidden="true">{warning.flag}</span>
        El código fue asignado por {warning.assignedBy}.
      </p>
      <p className="gs1-notice-caution">
        <AlertIcon size={18} />
        El prefijo GS1 no indica que el producto haya sido fabricado en Marruecos ni que su país de origen sea
        Marruecos.
      </p>
    </section>
  )
}
