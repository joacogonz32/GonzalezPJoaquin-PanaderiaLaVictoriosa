import { useId } from 'react'
import { obtenerEstiloCategoria } from '../utils/categorias'
import { formatearPrecio } from '../utils/formatters'

// Card de producto del boceto. En modo `compacta` (sección de destacados del inicio)
// muestra solo la información de presentación; en el catálogo agrega precio, stock y acciones.
export default function ProductCard({ producto, compacta = false, children }) {
  const tituloId = useId()
  const { emoji, clase } = obtenerEstiloCategoria(producto.categoria)
  const sinStock = !producto.porEncargo && producto.stock === 0

  return (
    <article className="card" aria-labelledby={tituloId}>
      <div className={`card__img ${clase}`}>
        <span className="card__emoji" role="img" aria-label={`Ilustración de ${producto.categoria.toLowerCase()}`}>
          {emoji}
        </span>
      </div>
      <div className="card__body">
        {!compacta && <p className="card__category">{producto.categoria}</p>}
        <h3 id={tituloId} className="card__title">{producto.nombre}</h3>
        <p className="card__desc">{producto.descripcion}</p>

        <div className="card__meta">
          {!compacta && <span className="card__price">{formatearPrecio(producto.precio)}</span>}
          <span className="card__tag">{producto.porEncargo ? 'Por encargo' : 'Horneado diario'}</span>
        </div>

        {!compacta && !producto.porEncargo && (
          <p className={`card__stock ${sinStock ? 'card__stock--empty' : ''}`}>
            {sinStock ? 'Sin stock por hoy' : `${producto.stock} disponibles hoy`}
          </p>
        )}
        {!compacta && producto.porEncargo && (
          <p className="card__stock">Se elabora a pedido, con 48 hs de anticipación.</p>
        )}

        {children && <div className="card__actions">{children}</div>}
      </div>
    </article>
  )
}
