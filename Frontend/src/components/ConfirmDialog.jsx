import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  variante = 'danger',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const cancelar = () => {
    if (!cargando) onCancelar()
  }

  return (
    <Modal abierto={abierto} titulo={titulo} onClose={cancelar}>
      <p>{mensaje}</p>
      <div className="modal__actions">
        <Button variant="secondary" onClick={cancelar} disabled={cargando}>
          {textoCancelar}
        </Button>
        <Button variant={variante} onClick={onConfirmar} cargando={cargando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
