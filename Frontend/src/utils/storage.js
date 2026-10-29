// Acceso seguro a localStorage (puede no estar disponible, por ejemplo en modo privado).
export function leerStorage(clave, valorPorDefecto = null) {
  try {
    const valor = localStorage.getItem(clave)
    return valor === null ? valorPorDefecto : JSON.parse(valor)
  } catch {
    return valorPorDefecto
  }
}

export function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Si no se puede guardar, la aplicación sigue funcionando sin persistencia local.
  }
}

export function borrarStorage(clave) {
  try {
    localStorage.removeItem(clave)
  } catch {
    // Ídem guardarStorage.
  }
}

export const CLAVES_STORAGE = Object.freeze({
  SESION: 'la-victoriosa:sesion',
  CARRITO: 'la-victoriosa:carrito',
})
