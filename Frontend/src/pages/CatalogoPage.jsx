import { useState } from 'react'
import { Link } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import Button from '../components/Button'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth, useCart, useToast } from '../context/contexts'
import { getCategorias, getProductos } from '../services/productosService'

const cargarCatalogo = () => Promise.all([getProductos(), getCategorias()])

export default function CatalogoPage() {
  usePageTitle('Nuestros productos')
  const { data, cargando, error, recargar } = useAsync(cargarCatalogo)
  const [categoria, setCategoria] = useState('')
  const { esAdmin } = useAuth()
  const { agregar, cantidadEnPedido, cantidadMaxima } = useCart()
  const { mostrarExito } = useToast()

  const [productos, categorias] = data ?? [[], []]
  const visibles = categoria ? productos.filter((p) => p.categoria === categoria) : productos

  const agregarAlPedido = (producto) => {
    agregar(producto)
    mostrarExito(`"${producto.nombre}" se agregó a tu pedido.`, 'Producto agregado')
  }

  const renderAcciones = (producto) => {
    if (esAdmin) return null

    const enPedido = cantidadEnPedido(producto.id)
    const sinStock = !producto.porEncargo && producto.stock === 0
    const alcanzoMaximo = enPedido >= cantidadMaxima(producto)

    return (
      <>
        <Button
          size="small"
          onClick={() => agregarAlPedido(producto)}
          disabled={sinStock || alcanzoMaximo}
          aria-label={`Agregar ${producto.nombre} al pedido`}
        >
          {sinStock ? 'Sin stock' : alcanzoMaximo ? 'Máximo alcanzado' : 'Agregar'}
        </Button>
        {enPedido > 0 && (
          <Link to="/pedido" className="btn btn--ghost btn--small">
            En tu pedido: {enPedido}
          </Link>
        )}
      </>
    )
  }

  return (
    <div className="page page--cream">
      <div className="page__container">
        <SectionHeader
          nivel={1}
          eyebrow="Nuestro menú"
          titulo="Nuestros productos"
          descripcion="Elegí productos del día para retirar en el local, o encargá tortas y sándwiches de miga con 48 hs de anticipación."
        />

        {cargando && !data && <Loader texto="Cargando productos…" />}
        {error && <ErrorMessage mensaje={error.message} onReintentar={recargar} />}

        {data && (
          <>
            <CategoryFilter categorias={categorias} seleccionada={categoria} onChange={setCategoria} />
            <p className="results-count" aria-live="polite">
              {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
              {categoria && ` en ${categoria}`}
            </p>

            {visibles.length === 0 ? (
              <EmptyState titulo="No hay productos en esta categoría" mensaje="Probá con otra categoría." />
            ) : (
              <ul className="product-grid">
                {visibles.map((producto) => (
                  <li key={producto.id}>
                    <ProductCard producto={producto}>{renderAcciones(producto)}</ProductCard>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
