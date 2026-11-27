import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/contexts'
import Loader from './Loader'
import AccesoDenegadoPage from '../pages/AccesoDenegadoPage'

// Restringe una pantalla a usuarios con sesión iniciada y, opcionalmente, a ciertos roles.
export default function ProtectedRoute({ roles, children }) {
  const { usuario, verificando } = useAuth()
  const location = useLocation()

  if (verificando) return <Loader texto="Verificando sesión…" />

  if (!usuario) {
    return <Navigate to="/ingresar" replace state={{ desde: location.pathname }} />
  }

  // Con sesión pero sin el rol necesario: se explica el motivo en lugar de redirigir en silencio.
  if (roles && !roles.includes(usuario.rol)) {
    return <AccesoDenegadoPage />
  }

  return children
}
