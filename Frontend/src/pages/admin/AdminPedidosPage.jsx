import { useCallback, useState } from 'react'
import SectionHeader from '../../components/SectionHeader'
import OrderCard from '../../components/OrderCard'
import FormField from '../../components/FormField'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import Loader from '../../components/Loader'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useToast } from '../../context/contexts'
import { avanzarEstadoPedido, cancelarPedido, getPedidos } from '../../services/pedidosService'
import { ESTADOS_PEDIDO, NOMBRES_TIPO_PEDIDO, TIPOS_PEDIDO } from '../../utils/constantes'

export default function AdminPedidosPage() {
  usePageTitle('Gestionar pedidos')
  const [filtros, setFiltros] = useState({ estado: '', tipo: '' })
  const cargarPedidos = useCallback(() => getPedidos(filtros), [filtros])
  const { data: pedidos, cargando, error, recargar } = useAsync(cargarPedidos)
  const { mostrarExito, mostrarError } = useToast()
  const [pedidoEnProceso, setPedidoEnProceso] = useState(null)
  const [pedidoARechazar, setPedidoARechazar] = useState(null)
  const [rechazando, setRechazando] = useState(false)

  const cambiarFiltro = (evento) => {
    const { name, value } = evento.target
    setFiltros((anteriores) => ({ ...anteriores, [name]: value }))
  }

  const avanzar = async (pedido) => {
    setPedidoEnProceso(pedido.id)
    try {
      const actualizado = await avanzarEstadoPedido(pedido.id)
      mostrarExito(`El pedido #${actualizado.id} pasó a «${actualizado.estado}».`, 'Estado actualizado')
      recargar()
    } catch (error) {
      mostrarError(error.message)
      recargar()
    } finally {
      setPedidoEnProceso(null)
    }
  }

  const confirmarRechazo = async () => {
    setRechazando(true)
    try {
      const actualizado = await cancelarPedido(pedidoARechazar.id)
      mostrarExito(`El pedido #${actualizado.id} fue cancelado.`, 'Pedido cancelado')
      recargar()
    } catch (error) {
      mostrarError(error.message)
      recargar()
    } finally {
      setRechazando(false)
      setPedidoARechazar(null)
    }
  }

  const hayFiltros = filtros.estado || filtros.tipo

  return (
    <div className="page page--cream">
      <div className="page__container page__container--medium">
        <SectionHeader
          nivel={1}
          eyebrow="Administración"
          titulo="Pedidos y encargos"
          descripcion="Avanzá cada pedido por su flujo de estados o rechazalo mientras no haya entrado en preparación."
        />

        <div className="toolbar">
          <div className="toolbar__filters">
            <FormField as="select" label="Estado" name="estado" value={filtros.estado} onChange={cambiarFiltro}>
              <option value="">Todos</option>
              {ESTADOS_PEDIDO.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </FormField>
            <FormField as="select" label="Tipo" name="tipo" value={filtros.tipo} onChange={cambiarFiltro}>
              <option value="">Todos</option>
              {Object.values(TIPOS_PEDIDO).map((tipo) => (
                <option key={tipo} value={tipo}>{NOMBRES_TIPO_PEDIDO[tipo]}</option>
              ))}
            </FormField>
          </div>
          <Button variant="secondary" size="small" onClick={recargar} cargando={cargando && Boolean(pedidos)}>
            Actualizar
          </Button>
        </div>

        {cargando && !pedidos && <Loader texto="Cargando pedidos…" />}
        {error && <ErrorMessage mensaje={error.message} onReintentar={recargar} />}

        {pedidos?.length === 0 && (
          <EmptyState
            titulo={hayFiltros ? 'No hay pedidos con estos filtros' : 'Todavía no hay pedidos'}
            mensaje={hayFiltros ? 'Probá con otra combinación de estado y tipo.' : 'Los pedidos que hagan los clientes van a aparecer acá.'}
          />
        )}

        {pedidos?.length > 0 && (
          <>
            <p className="results-count" aria-live="polite">
              {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </p>
            <ul className="list">
              {pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <OrderCard pedido={pedido} mostrarCliente>
                    {pedido.cancelable && (
                      <Button variant="secondary" size="small" onClick={() => setPedidoARechazar(pedido)}>
                        {pedido.tipo === TIPOS_PEDIDO.ENCARGO ? 'Rechazar encargo' : 'Cancelar pedido'}
                      </Button>
                    )}
                    {pedido.siguienteEstado && (
                      <Button
                        size="small"
                        onClick={() => avanzar(pedido)}
                        cargando={pedidoEnProceso === pedido.id}
                        disabled={pedidoEnProceso !== null}
                      >
                        Pasar a «{pedido.siguienteEstado}»
                      </Button>
                    )}
                  </OrderCard>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        abierto={Boolean(pedidoARechazar)}
        titulo={pedidoARechazar?.tipo === TIPOS_PEDIDO.ENCARGO ? '¿Rechazar el encargo?' : '¿Cancelar el pedido?'}
        mensaje={pedidoARechazar
          ? `El ${NOMBRES_TIPO_PEDIDO[pedidoARechazar.tipo].toLowerCase()} #${pedidoARechazar.id} de ${pedidoARechazar.cliente?.nombre ?? 'el cliente'} quedará cancelado. Esta acción no se puede deshacer.`
          : ''}
        textoConfirmar="Sí, cancelar"
        cargando={rechazando}
        onConfirmar={confirmarRechazo}
        onCancelar={() => setPedidoARechazar(null)}
      />
    </div>
  )
}
