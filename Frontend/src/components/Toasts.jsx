const ICONOS = { success: '✓', error: '!', info: 'i' }

export default function Toasts({ toasts, onClose }) {
  return (
    <section aria-label="Notificaciones">
      <ul className="toasts">
        {toasts.map((toast) => (
          <li
            key={toast.id}
            className={`toast toast--${toast.tipo}`}
            role={toast.tipo === 'error' ? 'alert' : 'status'}
          >
            <span className="toast__icon" aria-hidden="true">{ICONOS[toast.tipo]}</span>
            <p className="toast__message">
              {toast.titulo && <strong className="toast__title">{toast.titulo}</strong>}
              {toast.mensaje}
            </p>
            <button
              type="button"
              className="toast__close"
              onClick={() => onClose(toast.id)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
