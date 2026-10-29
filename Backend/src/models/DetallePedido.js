// Guarda nombre y precio del producto al momento de la compra,
// para que el historial no cambie si luego se edita o elimina el producto.
class DetallePedido {
    constructor(productoId, nombreProducto, precioUnitario, cantidad) {
        this.productoId = productoId;
        this.nombreProducto = nombreProducto;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
        this.subtotal = precioUnitario * cantidad;
    }
}

export default DetallePedido;
