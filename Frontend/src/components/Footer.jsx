export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer__grid">
        <div>
          <p className="footer__brand-name">La Victoriosa</p>
          <p className="footer__brand-sub">Panadería Artesanal</p>
          <p className="footer__brand-desc">
            Panificación tradicional, repostería artesanal y preparaciones saladas en el corazón de Villa Urquiza.
          </p>
        </div>
        <div className="footer__col">
          <h2 className="footer__col-title">Contacto</h2>
          <address>
            Cullen 5224, Villa Urquiza<br />
            Ciudad Autónoma de Buenos Aires<br />
            <br />
            <a href="tel:+541145212319">+54 11 4521-2319</a>
          </address>
        </div>
        <div className="footer__col">
          <h2 className="footer__col-title">Horarios</h2>
          <p>
            Lunes a Sábado<br />
            07:00 – 21:00 hs<br />
            <br />
            Domingos<br />
            08:00 – 20:00 hs
          </p>
        </div>
      </div>
      <p className="footer__bottom">© 2025 Panadería La Victoriosa · Villa Urquiza, Buenos Aires</p>
    </footer>
  )
}
