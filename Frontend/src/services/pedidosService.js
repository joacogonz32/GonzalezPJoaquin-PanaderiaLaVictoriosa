import { request } from './api'

export function crearPedido(pedido) {
  return request('/pedidos', { method: 'POST', body: pedido })
}

export function getMisPedidos() {
  return request('/pedidos/mios')
}

export function getPedidos({ estado, tipo } = {}) {
  const params = new URLSearchParams()
  if (estado) params.set('estado', estado)
  if (tipo) params.set('tipo', tipo)
  const query = params.toString()
  return request(`/pedidos${query ? `?${query}` : ''}`)
}

export function avanzarEstadoPedido(id) {
  return request(`/pedidos/${id}/avanzar`, { method: 'PATCH' })
}

export function cancelarPedido(id) {
  return request(`/pedidos/${id}/cancelar`, { method: 'PATCH' })
}
