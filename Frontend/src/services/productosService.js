import { request } from './api'

export function getProductos() {
  return request('/productos')
}

export function getCategorias() {
  return request('/productos/categorias')
}

export function crearProducto(producto) {
  return request('/productos', { method: 'POST', body: producto })
}

export function actualizarProducto(id, producto) {
  return request(`/productos/${id}`, { method: 'PUT', body: producto })
}

export function eliminarProducto(id) {
  return request(`/productos/${id}`, { method: 'DELETE' })
}
