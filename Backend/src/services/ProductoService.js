import Producto from '../models/Producto.js';
import productoRepository from '../repositories/ProductoRepository.js';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

const CAMPOS_ACTUALIZABLES = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];

class ProductoService {
    obtenerTodos() {
        return productoRepository.findAll();
    }

    obtenerPorId(id) {
        const producto = productoRepository.findById(id);
        if (!producto) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }

    crear({ nombre, descripcion, precio, stock, categoria }) {
        if (!nombre || precio === undefined || stock === undefined) {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        if (typeof precio !== 'number' || typeof stock !== 'number') {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        if (productoRepository.findByNombre(nombre)) {
            throw new ConflictError(Messages.DUPLICATED_RESOURCE);
        }

        const nuevoProducto = new Producto(null, nombre, descripcion, precio, stock, categoria);
        return productoRepository.create(nuevoProducto);
    }

    actualizar(id, datos) {
        this.obtenerPorId(id);

        const datosActualizados = {};
        for (const campo of CAMPOS_ACTUALIZABLES) {
            if (datos[campo] !== undefined) {
                datosActualizados[campo] = datos[campo];
            }
        }

        if (datosActualizados.precio !== undefined && typeof datosActualizados.precio !== 'number') {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        if (datosActualizados.stock !== undefined && typeof datosActualizados.stock !== 'number') {
            throw new BadRequestError(Messages.INVALID_DATA);
        }

        return productoRepository.update(id, datosActualizados);
    }

    eliminar(id) {
        this.obtenerPorId(id);
        productoRepository.delete(id);
    }
}

export default new ProductoService();
