// Pedido en preparación de un cliente: los productos que eligió y todavía no confirmó.
// Cada cliente tiene un único carrito, identificado por su ID.
class Carrito {
    constructor(clienteId, items = []) {
        this.clienteId = clienteId;
        this.items = items;
    }
}

export default Carrito;
