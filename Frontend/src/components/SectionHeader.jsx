// Encabezado de sección del boceto: etiqueta dorada, título y divisor.
export default function SectionHeader({ eyebrow, titulo, descripcion, nivel = 2, id }) {
  const Titulo = `h${nivel}`

  return (
    <header className="section-header">
      {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
      <Titulo id={id} className="section-header__title">{titulo}</Titulo>
      <hr className="section-header__divider" aria-hidden="true" />
      {descripcion && <p className="section-header__description">{descripcion}</p>}
    </header>
  )
}
