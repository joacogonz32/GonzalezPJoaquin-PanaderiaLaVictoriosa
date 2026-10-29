// Botones para filtrar por categoría. Un valor vacío representa "Todas".
export default function CategoryFilter({ categorias, seleccionada, onChange }) {
  const opciones = [{ valor: '', texto: 'Todas' }, ...categorias.map((c) => ({ valor: c, texto: c }))]

  return (
    <div className="category-filter" role="group" aria-label="Filtrar por categoría">
      {opciones.map(({ valor, texto }) => (
        <button
          key={texto}
          type="button"
          className="category-filter__btn"
          aria-pressed={seleccionada === valor}
          onClick={() => onChange(valor)}
        >
          {texto}
        </button>
      ))}
    </div>
  )
}
