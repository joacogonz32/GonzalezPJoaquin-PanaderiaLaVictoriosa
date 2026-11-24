import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartContext, useAuth, useToast } from './contexts'
import * as carritoService from '../services/carritoService'
import { leerStorage, guardarStorage, borrarStorage, CLAVES_STORAGE } from '../utils/storage'
import { CANTIDAD_MAXIMA_ENCARGO } from '../utils/constantes'

// Espera entre el último cambio y el guardado en la base, para no enviar una request por cada clic.
const DEMORA_GUARDADO_MS = 400

const calcularMaximo = (producto) => (producto.porEncargo ? CANTIDAD_MAXIMA_ENCARGO : producto.stock)

// Suma al carrito de la cuenta lo que se eligió como invitado, sin superar el máximo de cada producto.
function combinar(deLaCuenta, delInvitado) {
  const resultado = deLaCuenta.map((item) => ({ ...item }))
  for (const item of delInvitado) {
    const existente = resultado.find((actual) => actual.producto.id === item.producto.id)
    if (existente) {
      existente.cantidad = Math.min(existente.cantidad + item.cantidad, Math.max(1, calcularMaximo(existente.producto)))
    } else {
      resultado.push(item)
    }
  }
  return resultado
}

// Pedido en preparación (carrito).
// - Invitado: vive en el navegador (localStorage).
// - Cliente con sesión: se guarda en la base de datos (carritos/{clienteId} en Firestore), así se
//   conserva entre dispositivos. Al iniciar sesión, lo elegido como invitado se suma al de la cuenta.
// Al confirmarlo se envía al backend, que valida stock, fechas y reglas de negocio,
// y vacía el carrito guardado en la misma operación.
export function CartProvider({ children }) {
  const { usuario, esCliente, verificando } = useAuth()
  const { mostrarError } = useToast()
  const [items, setItems] = useState(() => leerStorage(CLAVES_STORAGE.CARRITO, []))
  const [cargando, setCargando] = useState(false)

  const clienteId = esCliente && !verificando ? usuario.id : null
  // Cliente cuyo carrito ya se leyó de la base: recién entonces los cambios se guardan allí.
  const clienteCargado = useRef(null)
  // Evita volver a guardar lo que se acaba de leer de la base.
  const omitirGuardado = useRef(false)

  // Inicio de sesión como cliente: se trae el carrito de la cuenta y se le suma el del invitado.
  useEffect(() => {
    if (!clienteId) return undefined
    let cancelado = false
    const delInvitado = leerStorage(CLAVES_STORAGE.CARRITO, [])

    setCargando(true)
    carritoService.getCarrito()
      .then((carrito) => (
        delInvitado.length > 0 ? carritoService.guardarCarrito(combinar(carrito.items, delInvitado)) : carrito
      ))
      .then((carrito) => {
        if (cancelado) return
        borrarStorage(CLAVES_STORAGE.CARRITO)
        clienteCargado.current = clienteId
        omitirGuardado.current = true
        setItems(carrito.items)
      })
      .catch((error) => {
        if (!cancelado) mostrarError(`No se pudo recuperar tu pedido guardado. ${error.message}`)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [clienteId, mostrarError])

  // Cierre de sesión: el carrito era de la cuenta, así que el navegador queda con uno vacío.
  useEffect(() => {
    if (clienteId || clienteCargado.current === null) return
    clienteCargado.current = null
    setItems([])
  }, [clienteId])

  // Guarda cada cambio: en la base si es el carrito de la cuenta; si no, en el navegador.
  useEffect(() => {
    if (omitirGuardado.current) {
      omitirGuardado.current = false
      return undefined
    }
    if (!clienteId || clienteCargado.current !== clienteId) {
      guardarStorage(CLAVES_STORAGE.CARRITO, items)
      return undefined
    }

    const temporizador = setTimeout(() => {
      carritoService.guardarCarrito(items)
        .catch((error) => mostrarError(`No se pudo guardar tu pedido. ${error.message}`))
    }, DEMORA_GUARDADO_MS)
    return () => clearTimeout(temporizador)
  }, [items, clienteId, mostrarError])

  const cantidadMaxima = useCallback((producto) => calcularMaximo(producto), [])

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
  // y quita los productos que ya no existen. No hace falta guardarlo:
  // la base solo guarda productos y cantidades, y omite sola los productos eliminados.
  const sincronizar = useCallback((productos) => {
    omitirGuardado.current = true
    setItems((actuales) => actuales
      .map((item) => {
        const actualizado = productos.find((producto) => producto.id === item.producto.id)
        return actualizado ? { ...item, producto: actualizado } : null
      })
      .filter(Boolean))
  }, [])

  const value = useMemo(() => ({
    items,
    cargando,
    cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
    total: items.reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0),
    cantidadMaxima,
    cantidadEnPedido,
    agregar,
    actualizarCantidad,
    quitar,
    vaciar,
    sincronizar,
  }), [items, cargando, cantidadMaxima, cantidadEnPedido, agregar, actualizarCantidad, quitar, vaciar, sincronizar])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
