import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import QuantityInput from '../components/QuantityInput'
import FormField from '../components/FormField'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth, useCart, useToast } from '../context/contexts'
import { getProductos } from '../services/productosService'
import { crearPedido } from '../services/pedidosService'
import { obtenerEstiloCategoria } from '../utils/categorias'
import { aValorDatetimeLocal, formatearPrecio } from '../utils/formatters'
import { fechaMinimaEncargo, validarFechaEncargo } from '../utils/validaciones'
import { NOMBRES_TIPO_PEDIDO, PORCENTAJE_SENIA, TIPOS_PEDIDO } from '../utils/constantes'

export default function CarritoPage() {
  usePageTitle('Tu pedido')
  const { usuario, esAdmin } = useAuth()
  const { items, total, cantidadMaxima, actualizarCantidad, quitar, vaciar, sincronizar } = useCart()
  const { mostrarExito, mostrarError, mostrarInfo } = useToast()
  const navigate = useNavigate()

  const [tipoElegido, setTipoElegido] = useState(TIPOS_PEDIDO.REGULAR)
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [errorFecha, setErrorFecha] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Los productos que solo se venden por encargo obligan a que el pedido sea un Encargo Especial.
  const incluyeProductosPorEncargo = items.some((item) => item.producto.porEncargo)
  const tipo = incluyeProductosPorEncargo ? TIPOS_PEDIDO.ENCARGO : tipoElegido
  const esEncargo = tipo === TIPOS_PEDIDO.ENCARGO
  const itemsSinStock = esEncargo ? [] : items.filter((item) => item.cantidad > item.producto.stock)

  // Actualiza precios y stock del pedido con la información vigente del backend.
  useEffect(() => {
    getProductos().then(sincronizar).catch(() => {})
  }, [sincronizar])

  const confirmarPedido = async (evento) => {
    evento.preventDefault()

    if (!usuario) {
      mostrarInfo('Ingresá con tu cuenta para confirmar el pedido. Lo que elegiste queda guardado.', 'Falta iniciar sesión')
      navigate('/ingresar', { state: { desde: '/pedido' } })
      return
    }

    if (esEncargo) {
      const error = validarFechaEncargo(fechaRetiro)
      setErrorFecha(error)
      if (error) return
    }
    if (itemsSinStock.length > 0) {
      mostrarError('Ajustá las cantidades de los productos sin stock suficiente.')
      return
    }

    setEnviando(true)
    try {
      const pedido = await crearPedido({
        tipo,
        detalles: items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
        fechaRetiro: esEncargo ? new Date(fechaRetiro).toISOString() : undefined,
      })
      vaciar()
      mostrarExito(
        esEncargo
          ? `Recibimos tu encargo #${pedido.id}. Te contactaremos para coordinar la seña de ${formatearPrecio(pedido.montoSenia)}.`
          : `Recibimos tu pedido #${pedido.id}. Podés seguir su estado desde "Mis pedidos".`,
        '¡Pedido confirmado!'
      )
      navigate('/mis-pedidos')
    } catch (error) {
      mostrarError(error.message)
      // Si el error fue por stock, se actualizan los datos para mostrar lo disponible.
      getProductos().then(sincronizar).catch(() => {})
    } finally {
      setEnviando(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="page__container">
          <SectionHeader nivel={1} eyebrow="Tu pedido" titulo="Todavía no elegiste productos" />
          <EmptyState titulo="Tu pedido está vacío" mensaje="Recorré el catálogo y agregá lo que quieras retirar o encargar.">
            <Link to="/productos" className="btn btn--primary">Ver productos</Link>
          </EmptyState>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__container">
        <SectionHeader nivel={1} eyebrow="Tu pedido" titulo="Revisá y confirmá tu pedido" />

        <div className="cart-layout">
          <section aria-labelledby="titulo-productos-pedido">
            <h2 id="titulo-productos-pedido" className="visually-hidden">Productos elegidos</h2>
            <ul className="cart-items">
              {items.map(({ producto, cantidad }) => {
                const { emoji, clase } = obtenerEstiloCategoria(producto.categoria)
                const sinStock = !esEncargo && cantidad > producto.stock
                return (
                  <li key={producto.id} className="cart-item">
                    <div className={`cart-item__thumb ${clase}`} aria-hidden="true">{emoji}</div>
                    <div>
                      <p className="cart-item__name">{producto.nombre}</p>
                      <p className="cart-item__detail">
                        {formatearPrecio(producto.precio)} c/u
                        {producto.porEncargo ? ' · Por encargo' : ` · Stock hoy: ${producto.stock}`}
                      </p>
                      {sinStock && (
                        <p className="field__error">
                          {producto.stock === 0 ? 'Sin stock por hoy.' : `Solo quedan ${producto.stock}.`}
                        </p>
                      )}
                    </div>
                    <div className="cart-item__controls">
                      <QuantityInput
                        valor={cantidad}
                        max={Math.max(1, cantidadMaxima(producto))}
                        onChange={(nueva) => actualizarCantidad(producto.id, nueva)}
                        etiqueta={producto.nombre}
                      />
                      <span className="cart-item__subtotal">{formatearPrecio(producto.precio * cantidad)}</span>
                      <Button variant="ghost" size="small" onClick={() => quitar(producto.id)} aria-label={`Quitar ${producto.nombre} del pedido`}>
                        Quitar
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="cart-continue">
              <Link to="/productos">← Seguir agregando productos</Link>
            </p>
          </section>

          <aside className="summary" aria-labelledby="titulo-resumen">
            <h2 id="titulo-resumen" className="summary__title">Resumen</h2>

            <form className="form" onSubmit={confirmarPedido} noValidate>
              <fieldset className="field">
                <legend className="field__label">Tipo de pedido</legend>
                <div className="radio-group">
                  <label className="radio-card">
                    <input
                      type="radio"
                      name="tipo"
                      value={TIPOS_PEDIDO.REGULAR}
                      checked={tipo === TIPOS_PEDIDO.REGULAR}
                      onChange={() => setTipoElegido(TIPOS_PEDIDO.REGULAR)}
                      disabled={incluyeProductosPorEncargo}
                    />
                    <span>
                      <strong>Pedido regular</strong>
                      <span>Productos del día para retirar en el local.</span>
                    </span>
                  </label>
                  <label className="radio-card">
                    <input
                      type="radio"
                      name="tipo"
                      value={TIPOS_PEDIDO.ENCARGO}
                      checked={esEncargo}
                      onChange={() => setTipoElegido(TIPOS_PEDIDO.ENCARGO)}
                    />
                    <span>
                      <strong>Encargo especial</strong>
                      <span>Para una fecha, con 48 hs de anticipación y seña del 50%.</span>
                    </span>
                  </label>
                </div>
                {incluyeProductosPorEncargo && (
                  <p className="field__hint">Tu pedido incluye productos que se elaboran solo por encargo.</p>
                )}
              </fieldset>

              {esEncargo && (
                <FormField
                  label="Fecha y hora de retiro"
                  type="datetime-local"
                  value={fechaRetiro}
                  min={aValorDatetimeLocal(fechaMinimaEncargo())}
                  onChange={(evento) => {
                    setFechaRetiro(evento.target.value)
                    setErrorFecha(null)
                  }}
                  error={errorFecha}
                  hint="Mínimo 48 hs desde ahora."
                  required
                />
              )}

              <div>
                {items.map(({ producto, cantidad }) => (
                  <div key={producto.id} className="summary__line">
                    <span>{cantidad} × {producto.nombre}</span>
                    <span>{formatearPrecio(producto.precio * cantidad)}</span>
                  </div>
                ))}
                {esEncargo && (
                  <div className="summary__line">
                    <span>Seña a abonar (50%)</span>
                    <span>{formatearPrecio(Math.round(total * PORCENTAJE_SENIA))}</span>
                  </div>
                )}
                <div className="summary__line summary__line--total">
                  <span>Total</span>
                  <span>{formatearPrecio(total)}</span>
                </div>
              </div>

              {esAdmin ? (
                <p className="alert alert--info">Los pedidos se realizan con una cuenta de cliente.</p>
              ) : (
                <Button type="submit" block cargando={enviando}>
                  {usuario ? `Confirmar ${NOMBRES_TIPO_PEDIDO[tipo].toLowerCase()}` : 'Ingresar para confirmar'}
                </Button>
              )}
              <p className="field__hint">Retiro en el local: Cullen 5224, Villa Urquiza.</p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  )
}
