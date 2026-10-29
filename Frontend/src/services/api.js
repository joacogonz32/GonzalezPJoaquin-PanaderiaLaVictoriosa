import { leerStorage, CLAVES_STORAGE } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const EVENTO_SESION_EXPIRADA = 'la-victoriosa:sesion-expirada'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Cliente HTTP común a todos los servicios.
// El backend responde { success, data } o { success: false, message }.
export async function request(ruta, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = leerStorage(CLAVES_STORAGE.SESION)?.token
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.', 0)
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
    throw new ApiError(payload?.message ?? 'Ocurrió un error inesperado. Intentá nuevamente.', response.status)
  }

  return payload.data
}
