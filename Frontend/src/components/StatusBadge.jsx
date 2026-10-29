import { obtenerClaseEstado } from '../utils/estadosPedido'

export default function StatusBadge({ estado }) {
  return <span className={`badge ${obtenerClaseEstado(estado)}`}>{estado}</span>
}
