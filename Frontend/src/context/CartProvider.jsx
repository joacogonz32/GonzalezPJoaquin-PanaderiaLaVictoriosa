import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './contexts'
import { leerStorage, guardarStorage, CLAVES_STORAGE } from '../utils/storage'
import { CANTIDAD_MAXIMA_ENCARGO } from '../utils/constantes'

// Pedido en preparación: vive en el navegador hasta que el cliente lo confirma.
// Al confirmarlo se envía al backend, que valida stock, fechas y reglas de negocio.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => leerStorage(CLAVES_STORAGE.CARRITO, []))

  useEffect(() => {
    guardarStorage(CLAVES_STORAGE.CARRITO, items)
  }, [items])

  const cantidadMaxima = useCallback((producto) => (
    producto.porEncargo ? CANTIDAD_MAXIMA_ENCARGO : producto.stock
  ), [])

  const cantidadEnPedido = useCallback((productoId) => (
    items.find((item) => item.producto.id === productoId)?.cantidad ?? 0
  ), [items])

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((actuales) => {
      const existente = actuales.find((item) => item.producto.id === producto.id)
      const nuevaCantidad = Math.min((existente?.cantidad ?? 0) + cantidad, cantidadMaxima(producto))
      if (existente) {
        return actuales.map((item) => (
          item.producto.id === producto.id ? { producto, cantidad: nuevaCantidad } : item
        ))
      }
      return [...actuales, { producto, cantidad: nuevaCantidad }]
    })
  }, [cantidadMaxima])

  const actualizarCantidad = useCallback((productoId, cantidad) => {
    setItems((actuales) => actuales.map((item) => (
      item.producto.id === productoId
        ? { ...item, cantidad: Math.max(1, Math.min(cantidad, cantidadMaxima(item.producto))) }
        : item
    )))
  }, [cantidadMaxima])

  const quitar = useCallback((productoId) => {
    setItems((actuales) => actuales.filter((item) => item.producto.id !== productoId))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  // Actualiza precios y stock con los datos vigentes del backend
  // y quita los productos que ya no existen.
  const sincronizar = useCallback((productos) => {
    setItems((actuales) => actuales
      .map((item) => {
        const actualizado = productos.find((producto) => producto.id === item.producto.id)
        return actualizado ? { ...item, producto: actualizado } : null
      })
      .filter(Boolean))
  }, [])

  const value = useMemo(() => ({
    items,
    cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
    total: items.reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0),
    cantidadMaxima,
    cantidadEnPedido,
    agregar,
    actualizarCantidad,
    quitar,
    vaciar,
    sincronizar,
  }), [items, cantidadMaxima, cantidadEnPedido, agregar, actualizarCantidad, quitar, vaciar, sincronizar])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
