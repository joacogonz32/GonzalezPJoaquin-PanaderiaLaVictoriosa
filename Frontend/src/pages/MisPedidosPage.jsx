import { useState } from 'react'
import { Link } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import OrderCard from '../components/OrderCard'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../context/contexts'
import { cancelarPedido, getMisPedidos } from '../services/pedidosService'
import { NOMBRES_TIPO_PEDIDO } from '../utils/constantes'

export default function MisPedidosPage() {
  usePageTitle('Mis pedidos')
  const { data: pedidos, cargando, error, recargar, setData } = useAsync(getMisPedidos)
  const { mostrarExito, mostrarError } = useToast()
  const [pedidoACancelar, setPedidoACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const confirmarCancelacion = async () => {
    setCancelando(true)
    try {
      const actualizado = await cancelarPedido(pedidoACancelar.id)
      setData((actuales) => actuales.map((p) => (p.id === actualizado.id ? actualizado : p)))
      mostrarExito(`${NOMBRES_TIPO_PEDIDO[actualizado.tipo]} #${actualizado.id} cancelado.`, 'Pedido cancelado')
    } catch (error) {
      mostrarError(error.message)
      recargar()
    } finally {
      setCancelando(false)
      setPedidoACancelar(null)
    }
  }

  return (
    <div className="page page--cream">
      <div className="page__container page__container--medium">
        <SectionHeader
          nivel={1}
          eyebrow="Tu cuenta"
          titulo="Mis pedidos"
          descripcion="Seguí el estado de tus pedidos y encargos. Podés cancelarlos mientras no hayan entrado en preparación."
        />

        {cargando && !pedidos && <Loader texto="Cargando tus pedidos…" />}
        {error && <ErrorMessage mensaje={error.message} onReintentar={recargar} />}

        {pedidos?.length === 0 && (
          <EmptyState titulo="Todavía no hiciste pedidos" mensaje="Cuando confirmes un pedido o un encargo, lo vas a ver acá.">
            <Link to="/productos" className="btn btn--primary">Ver productos</Link>
          </EmptyState>
        )}

        {pedidos?.length > 0 && (
          <ul className="list">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <OrderCard pedido={pedido}>
                  {pedido.cancelable && (
                    <Button variant="secondary" size="small" onClick={() => setPedidoACancelar(pedido)}>
                      Cancelar pedido
                    </Button>
                  )}
                </OrderCard>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        abierto={Boolean(pedidoACancelar)}
        titulo="¿Cancelar el pedido?"
        mensaje={pedidoACancelar
          ? `Vas a cancelar tu ${NOMBRES_TIPO_PEDIDO[pedidoACancelar.tipo].toLowerCase()} #${pedidoACancelar.id}. Esta acción no se puede deshacer.`
          : ''}
        textoConfirmar="Sí, cancelar"
        cargando={cancelando}
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setPedidoACancelar(null)}
      />
    </div>
  )
}
