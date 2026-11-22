import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import OrderCard from '../components/OrderCard'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import PagoSeniaDialog from '../components/PagoSeniaDialog'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../context/contexts'
import { cancelarPedido, getMisPedidos, pagarSenia } from '../services/pedidosService'
import { formatearPrecio } from '../utils/formatters'
import { NOMBRES_TIPO_PEDIDO } from '../utils/constantes'

export default function MisPedidosPage() {
  usePageTitle('Mis pedidos')
  const { data: pedidos, cargando, error, recargar, setData } = useAsync(getMisPedidos)
  const { mostrarExito, mostrarError } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const [pedidoACancelar, setPedidoACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  // Al confirmar un encargo, el carrito redirige acá indicando qué seña pagar.
  const [idAPagar, setIdAPagar] = useState(location.state?.pagarSeniaId ?? null)
  const [pagando, setPagando] = useState(false)

  const pedidoAPagar = pedidos?.find((pedido) => pedido.id === idAPagar && pedido.puedePagarSenia) ?? null

  const reemplazarPedido = (actualizado) => {
    setData((actuales) => actuales.map((p) => (p.id === actualizado.id ? actualizado : p)))
  }

  const cerrarPago = () => {
    setIdAPagar(null)
    // Limpia la indicación del carrito para que el modal no vuelva a abrirse al recargar.
    if (location.state?.pagarSeniaId) navigate(location.pathname, { replace: true, state: null })
  }

  const confirmarPago = async (medio) => {
    setPagando(true)
    try {
      const actualizado = await pagarSenia(pedidoAPagar.id, medio)
      reemplazarPedido(actualizado)
      mostrarExito(
        `Pagaste la seña de ${formatearPrecio(actualizado.montoSenia)} con ${medio}. ` +
          `El saldo de ${formatearPrecio(actualizado.saldo)} se abona en el local al retirar.`,
        `Encargo #${actualizado.id} confirmado`
      )
      cerrarPago()
    } catch (error) {
      mostrarError(error.message, 'No se pudo registrar el pago')
      recargar()
    } finally {
      setPagando(false)
    }
  }

  const confirmarCancelacion = async () => {
    setCancelando(true)
    try {
      const actualizado = await cancelarPedido(pedidoACancelar.id)
      reemplazarPedido(actualizado)
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
          descripcion="Seguí el estado de tus pedidos y encargos. Los encargos se confirman al pagar la seña; el resto se abona en el local al retirar."
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
                  {pedido.puedePagarSenia && (
                    <Button size="small" onClick={() => setIdAPagar(pedido.id)}>
                      Pagar seña ({formatearPrecio(pedido.montoSenia)})
                    </Button>
                  )}
                </OrderCard>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PagoSeniaDialog
        key={pedidoAPagar?.id ?? 'sin-pedido'}
        pedido={pedidoAPagar}
        cargando={pagando}
        onConfirmar={confirmarPago}
        onCancelar={cerrarPago}
      />

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
