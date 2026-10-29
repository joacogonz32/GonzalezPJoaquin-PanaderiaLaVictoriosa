import { useEffect, useId, useRef } from 'react'

// Usa el elemento nativo <dialog>, que mantiene el foco dentro del modal
// y permite cerrarlo con la tecla Escape.
export default function Modal({ abierto, titulo, onClose, children }) {
  const dialogRef = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (abierto && !dialog.open) dialog.showModal()
    if (!abierto && dialog.open) dialog.close()
  }, [abierto])

  const cerrarConEscape = (evento) => {
    evento.preventDefault()
    onClose()
  }

  const cerrarAlHacerClickFuera = (evento) => {
    if (evento.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={tituloId}
      onCancel={cerrarConEscape}
      onClick={cerrarAlHacerClickFuera}
    >
      {abierto && (
        <>
          <header className="modal__header">
            <h2 id={tituloId} className="modal__title">{titulo}</h2>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </header>
          <div className="modal__body">{children}</div>
        </>
      )}
    </dialog>
  )
}
