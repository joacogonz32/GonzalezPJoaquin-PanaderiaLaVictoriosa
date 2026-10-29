const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatearPrecio(valor) {
  return formatoPrecio.format(valor)
}

export function formatearFechaHora(fechaIso) {
  return `${formatoFechaHora.format(new Date(fechaIso))} hs`
}

// Convierte una fecha al formato que espera <input type="datetime-local"> (hora local).
export function aValorDatetimeLocal(fecha) {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
