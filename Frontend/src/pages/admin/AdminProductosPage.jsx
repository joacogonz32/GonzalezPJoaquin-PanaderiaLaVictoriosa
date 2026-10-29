import { useState } from 'react'
import SectionHeader from '../../components/SectionHeader'
import CategoryFilter from '../../components/CategoryFilter'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import ProductForm from '../../components/ProductForm'
import Loader from '../../components/Loader'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useToast } from '../../context/contexts'
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  getCategorias,
  getProductos,
} from '../../services/productosService'
import { formatearPrecio } from '../../utils/formatters'

const STOCK_BAJO = 5
const cargarDatos = () => Promise.all([getProductos(), getCategorias()])

export default function AdminProductosPage() {
  usePageTitle('Gestionar productos')
  const { data, cargando, error, recargar } = useAsync(cargarDatos)
  const { mostrarExito, mostrarError } = useToast()

  const [categoria, setCategoria] = useState('')
  const [formulario, setFormulario] = useState({ abierto: false, producto: null })
  const [guardando, setGuardando] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [productos, categorias] = data ?? [[], []]
  const visibles = categoria ? productos.filter((p) => p.categoria === categoria) : productos

  const abrirFormulario = (producto = null) => setFormulario({ abierto: true, producto })
  const cerrarFormulario = () => {
    if (!guardando) setFormulario({ abierto: false, producto: null })
  }

  const guardar = async (datos) => {
    setGuardando(true)
    try {
      if (formulario.producto) {
        await actualizarProducto(formulario.producto.id, datos)
        mostrarExito(`"${datos.nombre}" se actualizó correctamente.`, 'Producto actualizado')
      } else {
        await crearProducto(datos)
        mostrarExito(`"${datos.nombre}" se agregó al catálogo.`, 'Producto creado')
      }
      setFormulario({ abierto: false, producto: null })
      recargar()
    } catch (error) {
      mostrarError(error.message, 'No se pudo guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminacion = async () => {
    setEliminando(true)
    try {
      await eliminarProducto(productoAEliminar.id)
      mostrarExito(`"${productoAEliminar.nombre}" se eliminó del catálogo.`, 'Producto eliminado')
      recargar()
    } catch (error) {
      mostrarError(error.message, 'No se pudo eliminar el producto')
    } finally {
      setEliminando(false)
      setProductoAEliminar(null)
    }
  }

  return (
    <div className="page page--cream">
      <div className="page__container">
        <SectionHeader nivel={1} eyebrow="Administración" titulo="Productos y stock" />

        {cargando && !data && <Loader texto="Cargando productos…" />}
        {error && <ErrorMessage mensaje={error.message} onReintentar={recargar} />}

        {data && (
          <>
            <div className="toolbar">
              <p className="results-count" aria-live="polite">
                {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
                {categoria && ` en ${categoria}`}
              </p>
              <Button onClick={() => abrirFormulario()}>+ Nuevo producto</Button>
            </div>
            <CategoryFilter categorias={categorias} seleccionada={categoria} onChange={setCategoria} />

            {visibles.length === 0 ? (
              <EmptyState titulo="No hay productos para mostrar" mensaje="Creá un producto nuevo o elegí otra categoría." />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <caption className="visually-hidden">Productos del catálogo</caption>
                  <thead>
                    <tr>
                      <th scope="col">Producto</th>
                      <th scope="col">Categoría</th>
                      <th scope="col" className="is-number">Precio</th>
                      <th scope="col" className="is-number">Stock</th>
                      <th scope="col">Venta</th>
                      <th scope="col">Destacado</th>
                      <th scope="col" className="is-number">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((producto) => (
                      <tr key={producto.id}>
                        <td>
                          <span className="table__product-name">{producto.nombre}</span>
                          <br />
                          <span className="table__muted">#{producto.id}</span>
                        </td>
                        <td>{producto.categoria}</td>
                        <td className="is-number">{formatearPrecio(producto.precio)}</td>
                        <td className={`is-number ${!producto.porEncargo && producto.stock <= STOCK_BAJO ? 'stock--low' : ''}`}>
                          {producto.porEncargo ? '—' : producto.stock}
                        </td>
                        <td>{producto.porEncargo ? 'Por encargo' : 'Diaria'}</td>
                        <td>{producto.destacado ? 'Sí' : 'No'}</td>
                        <td>
                          <div className="table__actions">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => abrirFormulario(producto)}
                              aria-label={`Editar ${producto.nombre}`}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => setProductoAEliminar(producto)}
                              aria-label={`Eliminar ${producto.nombre}`}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        abierto={formulario.abierto}
        titulo={formulario.producto ? `Editar «${formulario.producto.nombre}»` : 'Nuevo producto'}
        onClose={cerrarFormulario}
      >
        <ProductForm
          key={formulario.producto?.id ?? 'nuevo'}
          producto={formulario.producto}
          categorias={categorias}
          guardando={guardando}
          onSubmit={guardar}
          onCancel={cerrarFormulario}
        />
      </Modal>

      <ConfirmDialog
        abierto={Boolean(productoAEliminar)}
        titulo="¿Eliminar producto?"
        mensaje={productoAEliminar
          ? `"${productoAEliminar.nombre}" dejará de mostrarse en el catálogo. Los pedidos ya realizados conservan su detalle. Esta acción no se puede deshacer.`
          : ''}
        textoConfirmar="Sí, eliminar"
        cargando={eliminando}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setProductoAEliminar(null)}
      />
    </div>
  )
}
