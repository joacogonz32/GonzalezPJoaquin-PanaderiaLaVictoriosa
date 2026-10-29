import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import AccountBar from './AccountBar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Al navegar se vuelve al inicio de la página, o a la sección indicada en el enlace (#nosotros, #contacto).
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <AccountBar />
      <Navbar />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
