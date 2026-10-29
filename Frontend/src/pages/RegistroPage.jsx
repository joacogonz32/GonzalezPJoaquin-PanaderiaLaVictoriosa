import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import FormField from '../components/FormField'
import Button from '../components/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth, useToast } from '../context/contexts'
import { validarRegistro } from '../utils/validaciones'
import { LONGITUD_MINIMA_CONTRASENA } from '../utils/constantes'

const VALORES_INICIALES = { nombre: '', email: '', telefono: '', contrasena: '', confirmacion: '' }

export default function RegistroPage() {
  usePageTitle('Crear cuenta')
  const { usuario, registrar } = useAuth()
  const { mostrarExito, mostrarError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [valores, setValores] = useState(VALORES_INICIALES)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  if (usuario && !enviando) return <Navigate to="/" replace />

  const cambiar = (evento) => {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validarRegistro(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      const nuevoUsuario = await registrar({
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        telefono: valores.telefono.trim(),
        contrasena: valores.contrasena,
      })
      mostrarExito(`Tu cuenta fue creada, ${nuevoUsuario.nombre}. Ya podés hacer tus pedidos.`, '¡Bienvenido/a!')
      navigate(location.state?.desde ?? '/productos', { replace: true })
    } catch (error) {
      mostrarError(error.message, 'No pudimos crear tu cuenta')
      setEnviando(false)
    }
  }

  return (
    <div className="page page--cream">
      <div className="page__container page__container--narrow">
        <SectionHeader nivel={1} eyebrow="Tu cuenta" titulo="Crear cuenta" />
        <div className="auth-card">
          <form className="form" onSubmit={enviar} noValidate>
            <FormField
              label="Nombre y apellido"
              name="nombre"
              autoComplete="name"
              value={valores.nombre}
              onChange={cambiar}
              error={errores.nombre}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={valores.email}
              onChange={cambiar}
              error={errores.email}
              required
            />
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              value={valores.telefono}
              onChange={cambiar}
              error={errores.telefono}
              hint="Lo usamos para avisarte cuando tu pedido esté listo."
              required
            />
            <FormField
              label="Contraseña"
              name="contrasena"
              type="password"
              autoComplete="new-password"
              value={valores.contrasena}
              onChange={cambiar}
              error={errores.contrasena}
              hint={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
              required
            />
            <FormField
              label="Repetir contraseña"
              name="confirmacion"
              type="password"
              autoComplete="new-password"
              value={valores.confirmacion}
              onChange={cambiar}
              error={errores.confirmacion}
              required
            />
            <Button type="submit" block cargando={enviando}>Crear cuenta</Button>
          </form>
          <p className="auth-card__footer">
            ¿Ya tenés cuenta? <Link to="/ingresar" state={location.state}>Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
