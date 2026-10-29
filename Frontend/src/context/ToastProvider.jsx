import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './contexts'
import Toasts from '../components/Toasts'

const DURACION_MS = 5000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const siguienteId = useRef(1)

  const cerrarToast = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id))
  }, [])

  const mostrarToast = useCallback((tipo, mensaje, titulo) => {
    const id = siguienteId.current++
    setToasts((actuales) => [...actuales, { id, tipo, mensaje, titulo }])
    setTimeout(() => cerrarToast(id), DURACION_MS)
  }, [cerrarToast])

  const value = useMemo(() => ({
    mostrarExito: (mensaje, titulo = 'Listo') => mostrarToast('success', mensaje, titulo),
    mostrarError: (mensaje, titulo = 'No se pudo completar la operación') => mostrarToast('error', mensaje, titulo),
    mostrarInfo: (mensaje, titulo) => mostrarToast('info', mensaje, titulo),
  }), [mostrarToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} onClose={cerrarToast} />
    </ToastContext.Provider>
  )
}
