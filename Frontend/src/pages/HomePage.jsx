import { Link } from 'react-router'
import Hero from '../components/Hero'
import SectionHeader from '../components/SectionHeader'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProductos } from '../services/productosService'

const CANTIDAD_DESTACADOS = 3

export default function HomePage() {
  usePageTitle()
  const { data: productos, cargando, error, recargar } = useAsync(getProductos)
  const destacados = (productos ?? []).filter((producto) => producto.destacado).slice(0, CANTIDAD_DESTACADOS)

  return (
    <>
      <Hero />

      <section className="home-section" id="nosotros" aria-labelledby="titulo-nosotros">
        <div className="sobre__inner">
          <SectionHeader eyebrow="Quiénes somos" titulo="Una panadería de toda la vida" id="titulo-nosotros" />
          <p>
            Panadería La Victoriosa es un negocio familiar ubicado en Cullen 5224, en el barrio de Villa Urquiza.
            Desde siempre nos dedicamos a la elaboración diaria de panificación tradicional, repostería artesanal
            y preparaciones saladas usando recetas que nos distinguen. Horneamos en múltiples turnos para que
            siempre encuentres algo recién salido del horno. El trato cercano y el vínculo con nuestros vecinos
            son lo que más nos enorgullece.
          </p>
        </div>
      </section>

      <section className="home-section home-section--cream" aria-labelledby="titulo-destacados">
        <SectionHeader eyebrow="Lo más pedido" titulo="Nuestros productos estrella" id="titulo-destacados" />

        {cargando && !productos && <Loader texto="Cargando productos…" />}
        {error && <ErrorMessage mensaje={error.message} onReintentar={recargar} />}
        {productos && destacados.length === 0 && (
          <EmptyState titulo="Pronto vas a ver nuestros destacados" mensaje="Mientras tanto, recorré el catálogo completo." />
        )}
        {destacados.length > 0 && (
          <ul className="product-grid">
            {destacados.map((producto) => (
              <li key={producto.id}>
                <ProductCard producto={producto} compacta />
              </li>
            ))}
          </ul>
        )}

        <div className="home-section__cta">
          <Link to="/productos" className="btn btn--secondary">Ver todos los productos</Link>
        </div>
      </section>
    </>
  )
}
