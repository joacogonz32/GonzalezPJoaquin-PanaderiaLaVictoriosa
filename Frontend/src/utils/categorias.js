// Representación visual de cada categoría (ilustración y fondo de la card).
const ESTILOS_CATEGORIA = {
  Facturas: { emoji: '🥐', clase: 'card__img--facturas' },
  Panes: { emoji: '🥖', clase: 'card__img--panes' },
  Sándwiches: { emoji: '🥪', clase: 'card__img--sandwiches' },
  Repostería: { emoji: '🎂', clase: 'card__img--reposteria' },
}

const ESTILO_POR_DEFECTO = { emoji: '🍞', clase: 'card__img--panes' }

export function obtenerEstiloCategoria(categoria) {
  return ESTILOS_CATEGORIA[categoria] ?? ESTILO_POR_DEFECTO
}
