import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Página no encontrada')

  return (
    <div className="page">
      <div className="page__container not-found">
        <p className="not-found__code" aria-hidden="true">404</p>
        <h1 className="section-header__title">No encontramos esta página</h1>
        <p className="section-header__description">
          Puede que el enlace esté mal escrito o que la página ya no exista.
        </p>
        <p className="home-section__cta">
          <Link to="/" className="btn btn--primary">Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
