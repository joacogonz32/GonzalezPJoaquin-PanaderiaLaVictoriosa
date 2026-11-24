// Línea del carrito: qué producto eligió el cliente y cuántas unidades.
// A diferencia de DetallePedido no guarda nombre ni precio: el carrito siempre
// se muestra con los datos vigentes del producto.
class ItemCarrito {
    constructor(productoId, cantidad) {
        this.productoId = productoId;
        this.cantidad = cantidad;
    }
}

export default ItemCarrito;
