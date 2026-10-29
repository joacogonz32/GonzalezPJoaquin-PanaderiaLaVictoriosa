import { HORAS_ANTICIPACION_ENCARGO, LONGITUD_MINIMA_CONTRASENA } from './constantes'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const estaVacio = (valor) => String(valor ?? '').trim() === ''

// Cada función devuelve un objeto { campo: mensaje }. Si está vacío, no hay errores.

export function validarLogin({ email, contrasena }) {
  const errores = {}
  if (estaVacio(email)) errores.email = 'Ingresá tu email.'
  else if (!EMAIL_REGEX.test(email.trim())) errores.email = 'El formato del email no es válido.'
  if (estaVacio(contrasena)) errores.contrasena = 'Ingresá tu contraseña.'
  return errores
}

export function validarRegistro({ nombre, email, telefono, contrasena, confirmacion }) {
  const errores = validarLogin({ email, contrasena })
  if (estaVacio(nombre)) errores.nombre = 'Ingresá tu nombre.'
  if (estaVacio(telefono)) errores.telefono = 'Ingresá un teléfono de contacto.'
  else if (telefono.replace(/\D/g, '').length < 8) errores.telefono = 'El teléfono debe tener al menos 8 dígitos.'
  if (!errores.contrasena && contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    errores.contrasena = `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`
  }
  if (confirmacion !== contrasena) errores.confirmacion = 'Las contraseñas no coinciden.'
  return errores
}

export function validarProducto({ nombre, precio, stock, categoria }) {
  const errores = {}
  if (estaVacio(nombre)) errores.nombre = 'El nombre es obligatorio.'
  if (estaVacio(precio) || !(Number(precio) > 0)) errores.precio = 'Ingresá un precio mayor a cero.'
  if (estaVacio(stock) || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
    errores.stock = 'El stock debe ser un número entero mayor o igual a cero.'
  }
  if (estaVacio(categoria)) errores.categoria = 'Elegí una categoría.'
  return errores
}

export function fechaMinimaEncargo() {
  return new Date(Date.now() + HORAS_ANTICIPACION_ENCARGO * 60 * 60 * 1000)
}

export function validarFechaEncargo(fechaRetiro) {
  if (estaVacio(fechaRetiro)) return 'Elegí la fecha y hora de retiro.'
  const fecha = new Date(fechaRetiro)
  if (Number.isNaN(fecha.getTime())) return 'La fecha de retiro no es válida.'
  if (fecha < fechaMinimaEncargo()) {
    return `Los encargos requieren al menos ${HORAS_ANTICIPACION_ENCARGO} hs de anticipación.`
  }
  return null
}
