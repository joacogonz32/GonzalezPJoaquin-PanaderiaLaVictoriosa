import { useId } from 'react'

// Campo de formulario con label asociado, mensaje de ayuda y mensaje de error accesibles.
// `as` permite renderizar un input, select o textarea.
export default function FormField({
  label,
  error,
  hint,
  required = false,
  as: Control = 'input',
  id: idRecibido,
  children,
  ...props
}) {
  const idGenerado = useId()
  const id = idRecibido ?? idGenerado
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
      </label>
      <Control
        id={id}
        className="field__control"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Control>
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      {error && <p id={errorId} className="field__error">{error}</p>}
    </div>
  )
}

export function CheckboxField({ label, descripcion, ...props }) {
  return (
    <label className="checkbox">
      <input type="checkbox" {...props} />
      <span>
        {label}
        {descripcion && <small>{descripcion}</small>}
      </span>
    </label>
  )
}
