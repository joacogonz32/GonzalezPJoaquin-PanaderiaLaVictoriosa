import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

// Navbar del boceto: enlaces a ambos lados y logo centrado.
// En pantallas chicas los enlaces se agrupan en un menú desplegable.
export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()

  const enlacesIzquierda = [
    { to: '/', texto: 'Inicio', end: true },
    { to: '/productos', texto: 'Nuestros Productos' },
  ]
  const enlacesDerecha = [
    { to: { pathname: '/', hash: '#nosotros' }, texto: 'Sobre Nosotros' },
    { to: { pathname, hash: '#contacto' }, texto: 'Contacto' },
  ]

  const cerrarMenu = () => setMenuAbierto(false)

  const renderEnlace = ({ to, texto, end }) => (
    <li key={texto}>
      {typeof to === 'string'
        ? <NavLink to={to} end={end} onClick={cerrarMenu}>{texto}</NavLink>
        : <Link to={to} onClick={cerrarMenu}>{texto}</Link>}
    </li>
  )

  return (
    <>
      <nav className="navbar" aria-label="Navegación principal">
        <ul className="nav-links">{enlacesIzquierda.map(renderEnlace)}</ul>

        <Link to="/" className="nav-logo" aria-label="La Victoriosa, panadería artesanal. Ir al inicio">
          <span className="nav-logo__name">La Victoriosa</span>
          <span className="nav-logo__sub">Panadería Artesanal</span>
        </Link>

        <ul className="nav-links nav-links--right">{enlacesDerecha.map(renderEnlace)}</ul>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? 'Cerrar' : 'Menú'}
        </button>
      </nav>

      <nav id="menu-movil" className="nav-mobile" aria-label="Navegación principal (móvil)" hidden={!menuAbierto}>
        <ul>{[...enlacesIzquierda, ...enlacesDerecha].map(renderEnlace)}</ul>
      </nav>
    </>
  )
}
