import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import { formatearFechaHora, formatearPrecio } from '../utils/formatters'
import { MEDIOS_PAGO } from '../utils/constantes'

// Simulación del pago de la seña de un encargo: el cliente elige el medio de pago y confirma.
// No se piden datos de tarjeta ni se realiza ningún cobro real.
export default function PagoSeniaDialog({ pedido, cargando = false, onConfirmar, onCancelar }) {
  const [medio, setMedio] = useState(MEDIOS_PAGO[0].valor)

  const cancelar = () => {
    if (!cargando) onCancelar()
  }

  const enviar = (evento) => {
    evento.preventDefault()
    onConfirmar(medio)
  }

  return (
    <Modal abierto={Boolean(pedido)} titulo="Pagar la seña" onClose={cancelar}>
      {pedido && (
        <form className="form" onSubmit={enviar}>
          <p>
            Encargo especial #{pedido.id} · Retiro el {formatearFechaHora(pedido.fechaRetiro)}.
            Al pagar la seña el encargo queda confirmado y empezamos a organizar su elaboración.
          </p>

          <div>
            <div className="summary__line">
              <span>Seña a pagar ahora (50%)</span>
              <span>{formatearPrecio(pedido.montoSenia)}</span>
            </div>
            <div className="summary__line">
              <span>Saldo a pagar en el local al retirar</span>
              <span>{formatearPrecio(pedido.total - pedido.montoSenia)}</span>
            </div>
            <div className="summary__line summary__line--total">
              <span>Total del encargo</span>
              <span>{formatearPrecio(pedido.total)}</span>
            </div>
          </div>

          <fieldset className="field">
            <legend className="field__label">Medio de pago</legend>
            <div className="radio-group">
              {MEDIOS_PAGO.map(({ valor, descripcion }) => (
                <label key={valor} className="radio-card">
                  <input
                    type="radio"
                    name="medio"
                    value={valor}
                    checked={medio === valor}
                    onChange={() => setMedio(valor)}
                  />
                  <span>
                    <strong>{valor}</strong>
                    <span>{descripcion}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="alert alert--info">Es una simulación: no se realiza ningún cobro real.</p>

          <div className="modal__actions">
            <Button variant="secondary" onClick={cancelar} disabled={cargando}>Volver</Button>
            <Button type="submit" cargando={cargando}>
              Pagar {formatearPrecio(pedido.montoSenia)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
