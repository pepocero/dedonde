import { useId, useState, type FormEvent } from 'react'
import { isNumericBarcode, isValidBarcode, normalizeBarcode } from '../utils/barcode.ts'
import { SearchIcon } from './Icons.tsx'

type SearchBarProps = {
  onSearch: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
  label?: string
}

export default function SearchBar({
  onSearch,
  disabled = false,
  autoFocus = false,
  label = 'Introducir código manualmente',
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) {
      return
    }

    const code = normalizeBarcode(value)
    if (!code) {
      setError('Introduce un código de barras numérico.')
      return
    }
    if (!isNumericBarcode(value.replace(/\s+/g, ''))) {
      setError('El código solo puede contener números.')
      return
    }
    if (!isValidBarcode(code)) {
      setError('Introduce un código de barras numérico válido.')
      return
    }

    setError('')
    onSearch(code)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} noValidate>
      <label className="search-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="search-row">
        <input
          id={inputId}
          className="search-input"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          pattern="[0-9]*"
          placeholder="Ej. 8410000000000"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d\s]/g, '')
            setValue(next)
            if (error) {
              setError('')
            }
          }}
        />
        <button type="submit" className="icon-submit" disabled={disabled} aria-label="Buscar código">
          <SearchIcon />
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  )
}
