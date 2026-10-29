import Producto from '../models/Producto.js';
import productoRepository from '../repositories/ProductoRepository.js';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { CATEGORIAS_VALIDAS } from '../enums/Categorias.js';
import { isNonEmptyString, isPositiveNumber, isNonNegativeInteger } from '../utils/validators.js';

const CAMPOS_ACTUALIZABLES = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'destacado', 'porEncargo'];

class ProductoService {
    obtenerTodos() {
        return productoRepository.findAll();
    }

    obtenerCategorias() {
        return CATEGORIAS_VALIDAS;
    }

    obtenerPorId(id) {
        const producto = productoRepository.findById(id);
        if (!producto) {
            throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
        }
        return producto;
    }

    crear(datos = {}) {
        const { nombre, descripcion = '', precio, stock, categoria, destacado = false, porEncargo = false } = datos;

        this.#validarCampos({ nombre, descripcion, precio, stock, categoria, destacado, porEncargo });
        this.#validarNombreDisponible(nombre);

        const nuevoProducto = new Producto(
            null, nombre.trim(), descripcion.trim(), precio, stock, categoria, destacado, porEncargo
        );
        return productoRepository.create(nuevoProducto);
    }

    actualizar(id, datos = {}) {
        this.obtenerPorId(id);

        const datosActualizados = {};
        for (const campo of CAMPOS_ACTUALIZABLES) {
            if (datos[campo] !== undefined) {
                datosActualizados[campo] = datos[campo];
            }
        }

        this.#validarCampos(datosActualizados, { parcial: true });
        if (datosActualizados.nombre !== undefined) {
            this.#validarNombreDisponible(datosActualizados.nombre, id);
            datosActualizados.nombre = datosActualizados.nombre.trim();
        }
        if (datosActualizados.descripcion !== undefined) {
            datosActualizados.descripcion = datosActualizados.descripcion.trim();
        }

        return productoRepository.update(id, datosActualizados);
    }

    eliminar(id) {
        this.obtenerPorId(id);
        productoRepository.delete(id);
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

    #validarNombreDisponible(nombre, idActual = null) {
        const existente = productoRepository.findByNombre(nombre.trim());
        if (existente && existente.id !== idActual) {
            throw new ConflictError(Messages.PRODUCT_NAME_DUPLICATED);
        }
    }
}

export default new ProductoService();
