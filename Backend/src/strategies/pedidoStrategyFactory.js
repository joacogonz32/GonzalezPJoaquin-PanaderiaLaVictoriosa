import PedidoRegularStrategy from './PedidoRegularStrategy.js';
import PedidoEncargoStrategy from './PedidoEncargoStrategy.js';
import { TiposPedido } from '../enums/Pedidos.js';

const estrategias = {
    [TiposPedido.REGULAR]: new PedidoRegularStrategy(),
    [TiposPedido.ENCARGO]: new PedidoEncargoStrategy()
};

// Devuelve la estrategia del tipo indicado, o undefined si el tipo no existe.
export function obtenerEstrategia(tipo) {
    return estrategias[tipo];
}
