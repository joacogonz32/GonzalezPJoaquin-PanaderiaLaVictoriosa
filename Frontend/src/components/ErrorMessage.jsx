import Button from './Button'

// Error al cargar información, con opción de reintentar la solicitud.
export default function ErrorMessage({ mensaje, onReintentar }) {
  return (
    <div className="alert alert--error" role="alert">
      <span>{mensaje}</span>
      {onReintentar && (
        <Button variant="secondary" size="small" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
