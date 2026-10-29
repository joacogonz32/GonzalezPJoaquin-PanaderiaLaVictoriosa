import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import SectionHeader from '../components/SectionHeader'
import FormField from '../components/FormField'
import Button from '../components/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth, useToast } from '../context/contexts'
import { validarLogin } from '../utils/validaciones'
import { ROLES } from '../utils/constantes'

export default function LoginPage() {
  usePageTitle('Ingresar')
  const { usuario, login } = useAuth()
  const { mostrarExito, mostrarError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [valores, setValores] = useState({ email: '', contrasena: '' })
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
    const nuevosErrores = validarLogin(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      const usuarioLogueado = await login({ email: valores.email.trim(), contrasena: valores.contrasena })
      mostrarExito(`Ingresaste como ${usuarioLogueado.nombre}.`, '¡Bienvenido/a!')
      const destinoPorRol = usuarioLogueado.rol === ROLES.ADMINISTRADOR ? '/admin/pedidos' : '/productos'
      navigate(location.state?.desde ?? destinoPorRol, { replace: true })
    } catch (error) {
      mostrarError(error.message, 'No pudimos iniciar tu sesión')
      setEnviando(false)
    }
  }

  return (
    <div className="page page--cream">
      <div className="page__container page__container--narrow">
        <SectionHeader nivel={1} eyebrow="Tu cuenta" titulo="Ingresar" />
        <div className="auth-card">
          <form className="form" onSubmit={enviar} noValidate>
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
              label="Contraseña"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              value={valores.contrasena}
              onChange={cambiar}
              error={errores.contrasena}
              required
            />
            <Button type="submit" block cargando={enviando}>Ingresar</Button>
          </form>
          <p className="auth-card__footer">
            ¿No tenés cuenta? <Link to="/registro" state={location.state}>Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
