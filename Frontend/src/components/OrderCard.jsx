import { useId } from 'react'
import StatusBadge from './StatusBadge'
import { formatearFechaHora, formatearPrecio } from '../utils/formatters'
import { NOMBRES_TIPO_PEDIDO } from '../utils/constantes'

// Detalle de un pedido. Lo usan "Mis pedidos" (cliente) y la gestión de pedidos (administrador);
// cada pantalla agrega sus propias acciones mediante `children`.
export default function OrderCard({ pedido, mostrarCliente = false, children }) {
  const tituloId = useId()
  const cancelado = pedido.estado === 'Cancelado'
  const indiceActual = pedido.flujo.indexOf(pedido.estado)

  return (
    <article className="order-card" aria-labelledby={tituloId}>
      <header className="order-card__header">
        <div>
          <h3 id={tituloId} className="order-card__title">
            {NOMBRES_TIPO_PEDIDO[pedido.tipo]} #{pedido.id}
          </h3>
          <p className="order-card__subtitle">Realizado el {formatearFechaHora(pedido.fecha)}</p>
        </div>
        <StatusBadge estado={pedido.estado} />
      </header>

      <ol
        className={`order-progress ${cancelado ? 'order-progress--cancelled' : ''}`}
        aria-label="Progreso del pedido"
      >
        {pedido.flujo.map((estado, indice) => {
          const esActual = indice === indiceActual
          const clase = esActual ? 'is-current' : indice < indiceActual ? 'is-done' : ''
          return (
            <li key={estado} className={clase} aria-current={esActual ? 'step' : undefined}>
              {estado}
            </li>
          )
        })}
      </ol>

      <dl className="order-card__info">
        {mostrarCliente && pedido.cliente && (
          <div>
            <dt>Cliente</dt>
            <dd>{pedido.cliente.nombre} · {pedido.cliente.telefono}</dd>
          </div>
        )}
        {pedido.fechaRetiro && (
          <div>
            <dt>Retiro</dt>
            <dd>{formatearFechaHora(pedido.fechaRetiro)}</dd>
          </div>
        )}
        <div>
          <dt>Lugar de retiro</dt>
          <dd>Cullen 5224, Villa Urquiza</dd>
        </div>
      </dl>

      <ul className="order-card__items" aria-label="Productos del pedido">
        {pedido.detalles.map((detalle) => (
          <li key={detalle.productoId}>
            <span>{detalle.cantidad} × {detalle.nombreProducto}</span>
            <span>{formatearPrecio(detalle.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="order-card__totals">
        {pedido.montoSenia !== null && (
          <span>Seña (50%): <strong>{formatearPrecio(pedido.montoSenia)}</strong></span>
        )}
        <span>Total: <strong>{formatearPrecio(pedido.total)}</strong></span>
      </div>

      {children && <div className="order-card__actions">{children}</div>}
    </article>
  )
}
