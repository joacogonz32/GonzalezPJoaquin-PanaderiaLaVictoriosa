const CLASES_ESTADO = {
  'Pendiente': 'badge--pendiente',
  'Confirmado': 'badge--confirmado',
  'Seña confirmada': 'badge--confirmado',
  'En preparación': 'badge--preparacion',
  'Listo para retirar': 'badge--listo',
  'Finalizado': 'badge--finalizado',
  'Cancelado': 'badge--cancelado',
}

export function obtenerClaseEstado(estado) {
  return CLASES_ESTADO[estado] ?? 'badge--pendiente'
}
