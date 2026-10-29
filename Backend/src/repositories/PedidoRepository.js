import { createIdGenerator } from '../utils/idGenerator.js';

const pedidos = [];
const generateId = createIdGenerator(1);

class PedidoRepository {
    findAll() {
        return pedidos;
    }

    findById(id) {
        return pedidos.find((pedido) => pedido.id === id);
    }

    findByClienteId(clienteId) {
        return pedidos.filter((pedido) => pedido.clienteId === clienteId);
    }

    create(pedido) {
        pedido.id = generateId();
        pedidos.push(pedido);
        return pedido;
    }

    update(id, datosActualizados) {
        const pedido = this.findById(id);
        if (!pedido) {
            return null;
        }
        Object.assign(pedido, datosActualizados);
        return pedido;
    }
}

export default new PedidoRepository();
