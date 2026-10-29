// Valores que deben coincidir con los enums del backend (Backend/src/enums).
export const TIPOS_PEDIDO = Object.freeze({
  REGULAR: 'REGULAR',
  ENCARGO: 'ENCARGO',
})

export const NOMBRES_TIPO_PEDIDO = Object.freeze({
  REGULAR: 'Pedido regular',
  ENCARGO: 'Encargo especial',
})

export const ESTADOS_PEDIDO = Object.freeze([
  'Pendiente',
  'Confirmado',
  'Seña confirmada',
  'En preparación',
  'Listo para retirar',
  'Finalizado',
  'Cancelado',
])

export const ROLES = Object.freeze({
  CLIENTE: 'CLIENTE',
  ADMINISTRADOR: 'ADMINISTRADOR',
})

// Reglas que el frontend usa para validar antes de enviar.
// La validación definitiva la realiza siempre el backend.
export const HORAS_ANTICIPACION_ENCARGO = 48
export const PORCENTAJE_SENIA = 0.5
export const LONGITUD_MINIMA_CONTRASENA = 6
export const CANTIDAD_MAXIMA_ENCARGO = 50
