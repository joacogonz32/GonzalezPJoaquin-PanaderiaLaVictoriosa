import PedidoStrategy from './PedidoStrategy.js';
import { EstadosPedido, ReglasPedido } from '../enums/Pedidos.js';
import { BadRequestError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { Roles } from '../enums/Roles.js';

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

// Encargo Especial: productos a pedido para una fecha de retiro futura.
// Se elaboran para la fecha, por eso no consumen el stock del día.
class PedidoEncargoStrategy extends PedidoStrategy {
    constructor() {
        super(
            [
                EstadosPedido.PENDIENTE,
                EstadosPedido.SENIA_CONFIRMADA,
                EstadosPedido.EN_PREPARACION,
                EstadosPedido.LISTO_PARA_RETIRAR,
                EstadosPedido.FINALIZADO
            ],
            [EstadosPedido.PENDIENTE, EstadosPedido.SENIA_CONFIRMADA]
        );
    }

    validar(_items, fechaRetiro) {
        if (!fechaRetiro) {
            throw new BadRequestError(Messages.ORDER_PICKUP_DATE_REQUIRED);
        }

        const horas = ReglasPedido.HORAS_ANTICIPACION_ENCARGO;
        const fechaMinima = Date.now() + horas * MILISEGUNDOS_POR_HORA;
        if (fechaRetiro.getTime() < fechaMinima) {
            throw new BadRequestError(Messages.ORDER_PICKUP_TOO_SOON(horas));
        }
    }

    calcularSenia(total) {
        return Math.round(total * ReglasPedido.PORCENTAJE_SENIA);
    }

    // La seña se paga mientras el encargo está Pendiente; al pagarla pasa a "Seña confirmada".
    puedePagarSenia(estadoActual) {
        return estadoActual === EstadosPedido.PENDIENTE;
    }

    // El administrador no puede confirmar la seña a mano: solo el pago del cliente la confirma.
    puedeAvanzarManualmente(estadoActual) {
        return estadoActual !== EstadosPedido.PENDIENTE && super.puedeAvanzarManualmente(estadoActual);
    }

    // Con la seña paga, el cliente ya no puede cancelar; el administrador todavía puede rechazar el encargo.
    puedeCancelarse(estadoActual, rol) {
        if (rol === Roles.CLIENTE) {
            return estadoActual === EstadosPedido.PENDIENTE;
        }
        return super.puedeCancelarse(estadoActual, rol);
    }
}

export default PedidoEncargoStrategy;
