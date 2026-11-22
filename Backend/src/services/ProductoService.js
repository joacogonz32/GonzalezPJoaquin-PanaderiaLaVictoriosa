import Producto from '../models/Producto.js';
import productoRepository from '../repositories/ProductoRepository.js';
import { ejecutarTransaccion } from '../repositories/transacciones.js';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { CATEGORIAS_VALIDAS } from '../enums/Categorias.js';
import { isNonEmptyString, isPositiveNumber, isNonNegativeInteger } from '../utils/validators.js';

const CAMPOS_ACTUALIZABLES = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'destacado', 'porEncargo'];

class ProductoService {
    async obtenerTodos() {
        return productoRepository.findAll();
    }

    obtenerCategorias() {
        return CATEGORIAS_VALIDAS;
    }

    async obtenerPorId(id, tx) {
        const producto = await productoRepository.findById(id, tx);
        if (!producto) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }

    async crear(datos = {}) {
        const { nombre, descripcion = '', precio, stock, categoria, destacado = false, porEncargo = false } = datos;

        this.#validarCampos({ nombre, descripcion, precio, stock, categoria, destacado, porEncargo });

        // Verificar el nombre y crear el producto en la misma transacción evita duplicados simultáneos.
        return ejecutarTransaccion(async (tx) => {
            await this.#validarNombreDisponible(nombre, null, tx);
            const nuevoProducto = new Producto(
                null, nombre.trim(), descripcion.trim(), precio, stock, categoria, destacado, porEncargo
            );
            return productoRepository.create(nuevoProducto, tx);
        });
    }

    async actualizar(id, datos = {}) {
        const datosActualizados = {};
        for (const campo of CAMPOS_ACTUALIZABLES) {
            if (datos[campo] !== undefined) {
                datosActualizados[campo] = datos[campo];
            }
        }

        this.#validarCampos(datosActualizados, { parcial: true });
        if (datosActualizados.nombre !== undefined) {
            datosActualizados.nombre = datosActualizados.nombre.trim();
        }
        if (datosActualizados.descripcion !== undefined) {
            datosActualizados.descripcion = datosActualizados.descripcion.trim();
        }

        return ejecutarTransaccion(async (tx) => {
            const producto = await this.obtenerPorId(id, tx);
            if (datosActualizados.nombre !== undefined) {
                await this.#validarNombreDisponible(datosActualizados.nombre, id, tx);
            }
            await productoRepository.update(id, datosActualizados, tx);
            return Object.assign(producto, datosActualizados);
        });
    }

    async eliminar(id) {
        await this.obtenerPorId(id);
        await productoRepository.delete(id);
    }

    // En modo parcial (PUT) solo se validan los campos presentes.
    #validarCampos(datos, { parcial = false } = {}) {
        const debeValidar = (campo) => !parcial || datos[campo] !== undefined;

        if (debeValidar('nombre') && !isNonEmptyString(datos.nombre)) {
            throw new BadRequestError(Messages.PRODUCT_NAME_REQUIRED);
        }
        if (datos.descripcion !== undefined && typeof datos.descripcion !== 'string') {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        if (debeValidar('precio') && !isPositiveNumber(datos.precio)) {
            throw new BadRequestError(Messages.PRODUCT_INVALID_PRICE);
        }
        if (debeValidar('stock') && !isNonNegativeInteger(datos.stock)) {
            throw new BadRequestError(Messages.PRODUCT_INVALID_STOCK);
        }
        if (debeValidar('categoria') && !CATEGORIAS_VALIDAS.includes(datos.categoria)) {
            throw new BadRequestError(Messages.PRODUCT_INVALID_CATEGORY);
        }
        for (const campo of ['destacado', 'porEncargo']) {
            if (datos[campo] !== undefined && typeof datos[campo] !== 'boolean') {
                throw new BadRequestError(Messages.PRODUCT_INVALID_FLAG);
            }
        }
    }

    async #validarNombreDisponible(nombre, idActual, tx) {
        const existente = await productoRepository.findByNombre(nombre, tx);
        if (existente && existente.id !== idActual) {
            throw new ConflictError(Messages.PRODUCT_NAME_DUPLICATED);
        }
    }
}

export default new ProductoService();
