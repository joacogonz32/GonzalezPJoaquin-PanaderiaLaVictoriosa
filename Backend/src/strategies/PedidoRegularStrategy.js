import PedidoStrategy from './PedidoStrategy.js';
import { EstadosPedido } from '../enums/Pedidos.js';
import { BadRequestError, ConflictError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

// Pedido Regular: productos del día para retirar en el local.
class PedidoRegularStrategy extends PedidoStrategy {
    constructor() {
        super(
            [
                EstadosPedido.PENDIENTE,
                EstadosPedido.CONFIRMADO,
                EstadosPedido.EN_PREPARACION,
                EstadosPedido.LISTO_PARA_RETIRAR,
                EstadosPedido.FINALIZADO
            ],
            [EstadosPedido.PENDIENTE, EstadosPedido.CONFIRMADO]
        );
    }

    validar(items) {
        for (const { producto, cantidad } of items) {
            if (producto.porEncargo) {
                throw new BadRequestError(Messages.ORDER_ITEM_ONLY_ENCARGO(producto.nombre));
            }
            if (cantidad > producto.stock) {
                throw new ConflictError(Messages.ORDER_INSUFFICIENT_STOCK(producto.nombre, producto.stock));
            }
        }
    }

    afectaStock() {
        return true;
    }
}

export default PedidoRegularStrategy;
