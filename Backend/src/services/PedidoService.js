import Pedido from '../models/Pedido.js';
import DetallePedido from '../models/DetallePedido.js';
import pedidoRepository from '../repositories/PedidoRepository.js';
import productoRepository from '../repositories/ProductoRepository.js';
import usuarioRepository from '../repositories/UsuarioRepository.js';
import { obtenerEstrategia } from '../strategies/pedidoStrategyFactory.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { EstadosPedido } from '../enums/Pedidos.js';
import { Roles } from '../enums/Roles.js';
import { isPositiveInteger } from '../utils/validators.js';

class PedidoService {
    crear(clienteId, datos = {}) {
        const { tipo, detalles, fechaRetiro } = datos;

        const estrategia = obtenerEstrategia(tipo);
        if (!estrategia) {
            throw new BadRequestError(Messages.ORDER_INVALID_TYPE);
        }

        const items = this.#resolverItems(detalles);
        const fecha = this.#parsearFechaRetiro(fechaRetiro);
        estrategia.validar(items, fecha);

        const detallesPedido = items.map(({ producto, cantidad }) =>
            new DetallePedido(producto.id, producto.nombre, producto.precio, cantidad)
        );
        const total = detallesPedido.reduce((suma, detalle) => suma + detalle.subtotal, 0);

        if (estrategia.afectaStock()) {
            for (const { producto, cantidad } of items) {
                productoRepository.update(producto.id, { stock: producto.stock - cantidad });
            }
        }

        const pedido = new Pedido(
            null,
            clienteId,
            new Date().toISOString(),
            tipo,
            estrategia.estadoInicial(),
            total,
            detallesPedido,
            fecha ? fecha.toISOString() : null,
            estrategia.calcularSenia(total)
        );
        return this.#aRespuesta(pedidoRepository.create(pedido));
    }

    obtenerTodos({ estado, tipo } = {}) {
        return this.#ordenarPorFecha(pedidoRepository.findAll())
            .filter((pedido) => !estado || pedido.estado === estado)
            .filter((pedido) => !tipo || pedido.tipo === tipo)
            .map((pedido) => this.#aRespuesta(pedido));
    }

    obtenerDeCliente(clienteId) {
        return this.#ordenarPorFecha(pedidoRepository.findByClienteId(clienteId))
            .map((pedido) => this.#aRespuesta(pedido));
    }

    obtenerPorId(id, usuario) {
        return this.#aRespuesta(this.#buscarAccesible(id, usuario));
    }

    // Solo el administrador avanza el estado, siguiendo el flujo de la estrategia.
    avanzarEstado(id) {
        const pedido = this.#buscar(id);
        const siguiente = obtenerEstrategia(pedido.tipo).siguienteEstado(pedido.estado);
        if (!siguiente) {
            throw new ConflictError(Messages.ORDER_FINAL_STATE);
        }
        return this.#aRespuesta(pedidoRepository.update(id, { estado: siguiente }));
    }

    // El cliente cancela su pedido; el administrador también puede rechazarlo.
    cancelar(id, usuario) {
        const pedido = this.#buscarAccesible(id, usuario);
        const estrategia = obtenerEstrategia(pedido.tipo);

        if (!estrategia.puedeCancelarse(pedido.estado)) {
            throw new ConflictError(Messages.ORDER_CANNOT_CANCEL);
        }

        if (estrategia.afectaStock()) {
            for (const detalle of pedido.detalles) {
                const producto = productoRepository.findById(detalle.productoId);
                if (producto) {
                    productoRepository.update(producto.id, { stock: producto.stock + detalle.cantidad });
                }
            }
        }

        return this.#aRespuesta(pedidoRepository.update(id, { estado: EstadosPedido.CANCELADO }));
    }

    #buscar(id) {
        const pedido = pedidoRepository.findById(id);
        if (!pedido) {
            throw new NotFoundError(Messages.ORDER_NOT_FOUND);
        }
        return pedido;
    }

    #buscarAccesible(id, usuario) {
        const pedido = this.#buscar(id);
        if (usuario.rol !== Roles.ADMINISTRADOR && pedido.clienteId !== usuario.id) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        return pedido;
    }

    // Convierte [{ productoId, cantidad }] en [{ producto, cantidad }] validando cada línea.
    #resolverItems(detalles) {
        if (!Array.isArray(detalles) || detalles.length === 0) {
            throw new BadRequestError(Messages.ORDER_EMPTY);
        }

        const idsVistos = new Set();
        return detalles.map((detalle) => {
            const { productoId, cantidad } = detalle ?? {};
            if (!isPositiveInteger(productoId) || !isPositiveInteger(cantidad)) {
                throw new BadRequestError(Messages.ORDER_INVALID_ITEM);
            }
            if (idsVistos.has(productoId)) {
                throw new BadRequestError(Messages.ORDER_DUPLICATED_ITEM);
            }
            idsVistos.add(productoId);

            const producto = productoRepository.findById(productoId);
            if (!producto) {
                throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
            }
            return { producto, cantidad };
        });
    }

    #parsearFechaRetiro(fechaRetiro) {
        if (fechaRetiro === undefined || fechaRetiro === null || fechaRetiro === '') {
            return null;
        }
        const fecha = new Date(fechaRetiro);
        if (typeof fechaRetiro !== 'string' || Number.isNaN(fecha.getTime())) {
            throw new BadRequestError(Messages.ORDER_INVALID_PICKUP_DATE);
        }
        return fecha;
    }

    #ordenarPorFecha(pedidos) {
        return [...pedidos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
    }

    // Agrega al pedido los datos del cliente y la información del flujo de estados,
    // para que el frontend no tenga que duplicar las reglas de la Strategy.
    #aRespuesta(pedido) {
        const estrategia = obtenerEstrategia(pedido.tipo);
        const cliente = usuarioRepository.findById(pedido.clienteId);
        const cancelado = pedido.estado === EstadosPedido.CANCELADO;

        return {
            ...pedido,
            cliente: cliente
                ? { id: cliente.id, nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono }
                : null,
            flujo: estrategia.flujo,
            siguienteEstado: cancelado ? null : estrategia.siguienteEstado(pedido.estado),
            cancelable: estrategia.puedeCancelarse(pedido.estado)
        };
    }
}

export default new PedidoService();
