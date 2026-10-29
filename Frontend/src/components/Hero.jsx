import { Link } from 'react-router'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titulo">
      <div className="hero__content">
        <p className="hero__eyebrow">Villa Urquiza · Buenos Aires</p>
        <h1 id="hero-titulo" className="hero__title">
          El sabor de siempre,<br />en el <em>corazón del barrio</em>
        </h1>
        <p className="hero__subtitle">
          Facturas frescas, panes artesanales y sándwiches de miga. Horneamos todos los días
          para que siempre encuentres algo recién salido del horno.
        </p>
        <Link to="/productos" className="btn btn--primary btn--large">Pedí ahora</Link>
      </div>
      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span>Explorá</span>
      </div>
    </section>
  )
}
