import Pedido from '../models/Pedido.js';
import DetallePedido from '../models/DetallePedido.js';
import PagoSenia from '../models/PagoSenia.js';
import pedidoRepository from '../repositories/PedidoRepository.js';
import productoRepository from '../repositories/ProductoRepository.js';
import usuarioRepository from '../repositories/UsuarioRepository.js';
import { ejecutarTransaccion } from '../repositories/transacciones.js';
import { obtenerEstrategia } from '../strategies/pedidoStrategyFactory.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { EstadosPedido, MEDIOS_PAGO_VALIDOS } from '../enums/Pedidos.js';
import { Roles } from '../enums/Roles.js';
import { isPositiveInteger } from '../utils/validators.js';

class PedidoService {
    // Crear el pedido y descontar el stock ocurre en una única transacción:
    // si dos clientes compran el último producto a la vez, solo uno lo consigue.
    async crear(clienteId, datos = {}) {
        const { tipo, detalles, fechaRetiro } = datos;

        const estrategia = obtenerEstrategia(tipo);
        if (!estrategia) {
            throw new BadRequestError(Messages.ORDER_INVALID_TYPE);
        }

        const lineas = this.#validarLineas(detalles);
        const fecha = this.#parsearFechaRetiro(fechaRetiro);

        const pedido = await ejecutarTransaccion(async (tx) => {
            // 1. Lecturas: productos con su stock actual.
            const items = await this.#resolverItems(lineas, tx);
            estrategia.validar(items, fecha);

            const detallesPedido = items.map(({ producto, cantidad }) =>
                new DetallePedido(producto.id, producto.nombre, producto.precio, cantidad)
            );
            const total = detallesPedido.reduce((suma, detalle) => suma + detalle.subtotal, 0);

            // 2. Escrituras: el pedido y, si corresponde, el nuevo stock.
            const nuevoPedido = await pedidoRepository.create(new Pedido(
                null,
                clienteId,
                new Date().toISOString(),
                tipo,
                estrategia.estadoInicial(),
                total,
                detallesPedido,
                fecha ? fecha.toISOString() : null,
                estrategia.calcularSenia(total)
            ), tx);

            if (estrategia.afectaStock()) {
                for (const { producto, cantidad } of items) {
                    await productoRepository.update(producto.id, { stock: producto.stock - cantidad }, tx);
                }
            }
            return nuevoPedido;
        });

        return this.#aRespuesta(pedido, Roles.CLIENTE);
    }

    async obtenerTodos({ estado, tipo } = {}) {
        const pedidos = await pedidoRepository.findAll({ estado, tipo });
        return this.#aRespuestas(this.#ordenarPorFecha(pedidos), Roles.ADMINISTRADOR);
    }

    async obtenerDeCliente(clienteId) {
        const pedidos = await pedidoRepository.findByClienteId(clienteId);
        return this.#aRespuestas(this.#ordenarPorFecha(pedidos), Roles.CLIENTE);
    }

    async obtenerPorId(id, usuario) {
        return this.#aRespuesta(await this.#buscarAccesible(id, usuario), usuario.rol);
    }

    // Solo el administrador avanza el estado, siguiendo el flujo de la estrategia.
    // Un encargo Pendiente no avanza a mano: lo confirma el pago de la seña.
    async avanzarEstado(id) {
        const pedido = await ejecutarTransaccion(async (tx) => {
            const pedidoActual = await this.#buscar(id, tx);
            const estrategia = obtenerEstrategia(pedidoActual.tipo);
            const siguiente = estrategia.siguienteEstado(pedidoActual.estado);
            if (!siguiente) {
                throw new ConflictError(Messages.ORDER_FINAL_STATE);
            }
            if (!estrategia.puedeAvanzarManualmente(pedidoActual.estado)) {
                throw new ConflictError(Messages.ORDER_DEPOSIT_REQUIRED);
            }
            await pedidoRepository.update(id, { estado: siguiente }, tx);
            pedidoActual.estado = siguiente;
            return pedidoActual;
        });
        return this.#aRespuesta(pedido, Roles.ADMINISTRADOR);
    }

    // Pago simulado de la seña de un encargo: registra el medio y la fecha
    // y pasa el encargo al siguiente estado ("Seña confirmada").
    // El saldo restante se abona en el local al retirar.
    async pagarSenia(id, usuario, datos = {}) {
        const { medio } = datos;
        if (!MEDIOS_PAGO_VALIDOS.includes(medio)) {
            throw new BadRequestError(Messages.ORDER_INVALID_PAYMENT_METHOD(MEDIOS_PAGO_VALIDOS));
        }

        const pedido = await ejecutarTransaccion(async (tx) => {
            const pedidoActual = await this.#buscarAccesible(id, usuario, tx);
            const estrategia = obtenerEstrategia(pedidoActual.tipo);
            if (!estrategia.puedePagarSenia(pedidoActual.estado)) {
                throw new ConflictError(Messages.ORDER_DEPOSIT_NOT_PENDING);
            }

            const pago = new PagoSenia(medio, new Date().toISOString());
            const nuevoEstado = estrategia.siguienteEstado(pedidoActual.estado);
            await pedidoRepository.update(id, { estado: nuevoEstado, pagoSenia: pago }, tx);

            pedidoActual.estado = nuevoEstado;
            pedidoActual.pagoSenia = pago;
            return pedidoActual;
        });
        return this.#aRespuesta(pedido, usuario.rol);
    }

    // El cliente cancela su pedido; el administrador también puede rechazarlo.
    async cancelar(id, usuario) {
        const pedido = await ejecutarTransaccion(async (tx) => {
            // 1. Lecturas: el pedido y, si devuelve stock, sus productos.
            const pedidoActual = await this.#buscarAccesible(id, usuario, tx);
            const estrategia = obtenerEstrategia(pedidoActual.tipo);

            if (!estrategia.puedeCancelarse(pedidoActual.estado, usuario.rol)) {
                // Si el administrador sí podría cancelarlo, el motivo es que la seña ya está paga.
                const soloAdministrador = estrategia.puedeCancelarse(pedidoActual.estado, Roles.ADMINISTRADOR);
                throw new ConflictError(soloAdministrador
                    ? Messages.ORDER_CANNOT_CANCEL_DEPOSIT_PAID
                    : Messages.ORDER_CANNOT_CANCEL);
            }

            const productos = estrategia.afectaStock()
                ? await Promise.all(pedidoActual.detalles.map((detalle) => productoRepository.findById(detalle.productoId, tx)))
                : [];

            // 2. Escrituras: el nuevo estado y la devolución del stock
            // (los productos eliminados del catálogo se omiten).
            await pedidoRepository.update(id, { estado: EstadosPedido.CANCELADO }, tx);
            for (const [indice, producto] of productos.entries()) {
                if (producto) {
                    const { cantidad } = pedidoActual.detalles[indice];
                    await productoRepository.update(producto.id, { stock: producto.stock + cantidad }, tx);
                }
            }

            pedidoActual.estado = EstadosPedido.CANCELADO;
            return pedidoActual;
        });
        return this.#aRespuesta(pedido, usuario.rol);
    }

    async #buscar(id, tx) {
        const pedido = await pedidoRepository.findById(id, tx);
        if (!pedido) {
            throw new NotFoundError(Messages.ORDER_NOT_FOUND);
        }
        return pedido;
    }

    async #buscarAccesible(id, usuario, tx) {
        const pedido = await this.#buscar(id, tx);
        if (usuario.rol !== Roles.ADMINISTRADOR && pedido.clienteId !== usuario.id) {
            throw new ForbiddenError(Messages.FORBIDDEN);
        }
        return pedido;
    }

    // Valida el formato de cada línea ({ productoId, cantidad }) antes de consultar la base.
    #validarLineas(detalles) {
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
            return { productoId, cantidad };
        });
    }

    // Convierte [{ productoId, cantidad }] en [{ producto, cantidad }] leyendo cada producto.
    async #resolverItems(lineas, tx) {
        const productos = await Promise.all(
            lineas.map(({ productoId }) => productoRepository.findById(productoId, tx))
        );
        return lineas.map(({ cantidad }, indice) => {
            if (!productos[indice]) {
                throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
            }
            return { producto: productos[indice], cantidad };
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

    async #aRespuesta(pedido, rol) {
        const [respuesta] = await this.#aRespuestas([pedido], rol);
        return respuesta;
    }

    // Agrega a cada pedido los datos del cliente y lo que puede hacer el usuario que lo consulta
    // (según su rol), para que el frontend no tenga que duplicar las reglas de la Strategy.
    // Los clientes se leen todos juntos en una sola consulta.
    async #aRespuestas(pedidos, rol) {
        const clientes = await usuarioRepository.findByIds(pedidos.map((pedido) => pedido.clienteId));

        return pedidos.map((pedido) => {
            const estrategia = obtenerEstrategia(pedido.tipo);
            const cliente = clientes.get(pedido.clienteId);
            const cancelado = pedido.estado === EstadosPedido.CANCELADO;

            return {
                ...pedido,
                cliente: cliente
                    ? { id: cliente.id, nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono }
                    : null,
                flujo: estrategia.flujo,
                siguienteEstado: cancelado ? null : estrategia.siguienteEstado(pedido.estado),
                avanzable: rol === Roles.ADMINISTRADOR && estrategia.puedeAvanzarManualmente(pedido.estado),
                cancelable: estrategia.puedeCancelarse(pedido.estado, rol),
                puedePagarSenia: rol === Roles.CLIENTE && estrategia.puedePagarSenia(pedido.estado),
                // Lo que falta abonar en el local al retirar.
                saldo: pedido.total - (pedido.pagoSenia ? pedido.montoSenia : 0)
            };
        });
    }
}

export default new PedidoService();
