import { request } from './api'

// Carrito del cliente con sesión iniciada, guardado en la base de datos.
// El backend responde { items: [{ producto, cantidad }], cantidadTotal, total }
// con los datos vigentes de cada producto.
export function getCarrito() {
  return request('/carrito')
}

// Reemplaza el carrito completo. `items`: [{ producto, cantidad }], como lo maneja el CartProvider.
export function guardarCarrito(items) {
  return request('/carrito', {
    method: 'PUT',
    body: { items: items.map(({ producto, cantidad }) => ({ productoId: producto.id, cantidad })) },
  })
}
