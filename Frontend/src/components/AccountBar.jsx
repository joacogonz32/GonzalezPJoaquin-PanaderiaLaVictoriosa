import { Link, useNavigate } from 'react-router'
import { useAuth, useCart, useToast } from '../context/contexts'

// Barra superior con las acciones de la cuenta según el tipo de usuario.
export default function AccountBar() {
  const { usuario, esAdmin, logout } = useAuth()
  const { cantidadTotal } = useCart()
  const { mostrarExito } = useToast()
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    mostrarExito('Cerraste sesión correctamente.', 'Hasta pronto')
    navigate('/')
  }

  const enlacePedido = (
    <Link to="/pedido">
      Tu pedido
      <span className="account-bar__cart-count" aria-label={`${cantidadTotal} productos`}>
        {cantidadTotal}
      </span>
    </Link>
  )

  return (
    <div className="account-bar">
      <div className="account-bar__inner">
        {!usuario && (
          <>
            {enlacePedido}
            <Link to="/ingresar">Ingresar</Link>
            <Link to="/registro">Crear cuenta</Link>
          </>
        )}

        {usuario && esAdmin && (
          <>
            <span>Administración</span>
            <Link to="/admin/pedidos">Gestionar pedidos</Link>
            <Link to="/admin/productos">Gestionar productos</Link>
          </>
        )}

        {usuario && !esAdmin && (
          <>
            <span>Hola, {usuario.nombre.split(' ')[0]}</span>
            <Link to="/mis-pedidos">Mis pedidos</Link>
            {enlacePedido}
          </>
        )}

        {usuario && <button type="button" onClick={cerrarSesion}>Salir</button>}
      </div>
    </div>
  )
}
