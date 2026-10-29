class Producto {
    constructor(id, nombre, descripcion, precio, stock, categoria, destacado = false, porEncargo = false) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.categoria = categoria;
        this.destacado = destacado;
        this.porEncargo = porEncargo;
    }
}

export default Producto;
