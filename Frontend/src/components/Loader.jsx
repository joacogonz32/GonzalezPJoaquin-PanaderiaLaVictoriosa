export default function Loader({ texto = 'Cargando…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}
