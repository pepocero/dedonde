type LoadingProps = {
  label?: string
}

export default function Loading({ label = 'Buscando producto…' }: LoadingProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
