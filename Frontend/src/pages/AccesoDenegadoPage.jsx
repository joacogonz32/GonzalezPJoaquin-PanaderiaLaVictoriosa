import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/contexts'

// Se muestra cuando un usuario con sesión iniciada entra a una pantalla de otro rol
// (por ejemplo, un cliente que abre la administración).
export default function AccesoDenegadoPage() {
  usePageTitle('Acceso restringido')
  const { esAdmin } = useAuth()

  return (
    <div className="page">
      <div className="page__container not-found">
        <p className="not-found__code" aria-hidden="true">403</p>
        <h1 className="section-header__title">No tenés acceso a esta sección</h1>
        <p className="section-header__description">
          {esAdmin
            ? 'Esta pantalla es para clientes. Los pedidos se realizan con una cuenta de cliente.'
            : 'Esta pantalla es solo para el personal de la panadería.'}
        </p>
        <p className="home-section__cta">
          <Link to={esAdmin ? '/admin/pedidos' : '/productos'} className="btn btn--primary">
            {esAdmin ? 'Ir a gestionar pedidos' : 'Ver productos'}
          </Link>
        </p>
      </div>
    </div>
  )
}
