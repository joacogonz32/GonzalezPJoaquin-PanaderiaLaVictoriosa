import espiga from '../assets/espiga.svg'

export default function EmptyState({ titulo, mensaje, children }) {
  return (
    <div className="empty-state">
      <img src={espiga} alt="" />
      <h2>{titulo}</h2>
      {mensaje && <p>{mensaje}</p>}
      {children}
    </div>
  )
}
