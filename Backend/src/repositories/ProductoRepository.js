import { createIdGenerator } from '../utils/idGenerator.js';

const productos = [];
const generateId = createIdGenerator(1);

class ProductoRepository {
    findAll() {
        return productos;
    }

    findById(id) {
        return productos.find((producto) => producto.id === id);
    }

    findByNombre(nombre) {
        return productos.find(
            (producto) => producto.nombre.toLowerCase() === nombre.toLowerCase()
        );
    }

    create(producto) {
        producto.id = generateId();
        productos.push(producto);
        return producto;
    }

    update(id, datosActualizados) {
        const producto = this.findById(id);
        if (!producto) {
            return null;
        }
        Object.assign(producto, datosActualizados);
        return producto;
    }

    delete(id) {
        const index = productos.findIndex((producto) => producto.id === id);
        if (index === -1) {
            return false;
        }
        productos.splice(index, 1);
        return true;
    }
}

export default new ProductoRepository();
