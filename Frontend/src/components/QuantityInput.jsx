export default function QuantityInput({ valor, min = 1, max, onChange, etiqueta }) {
  const cambiar = (nuevoValor) => {
    if (Number.isNaN(nuevoValor)) return
    onChange(Math.max(min, Math.min(nuevoValor, max)))
  }

  return (
    <div className="quantity">
      <button
        type="button"
        onClick={() => cambiar(valor - 1)}
        disabled={valor <= min}
        aria-label={`Restar una unidad de ${etiqueta}`}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={valor}
        min={min}
        max={max}
        onChange={(evento) => cambiar(parseInt(evento.target.value, 10))}
        aria-label={`Cantidad de ${etiqueta}`}
      />
      <button
        type="button"
        onClick={() => cambiar(valor + 1)}
        disabled={valor >= max}
        aria-label={`Sumar una unidad de ${etiqueta}`}
      >
        +
      </button>
    </div>
  )
}
