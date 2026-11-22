import productoService from '../services/ProductoService.js';
import { successResponse } from '../responses/ApiResponse.js';

class ProductoController {
    async obtenerTodos(req, res, next) {
        try {
            const productos = await productoService.obtenerTodos();
            return successResponse(res, productos);
        } catch (error) {
            next(error);
        }
    }

    obtenerCategorias(req, res, next) {
        try {
            const categorias = productoService.obtenerCategorias();
            return successResponse(res, categorias);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {
            const id = Number(req.params.id);
            const producto = await productoService.obtenerPorId(id);
            return successResponse(res, producto);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const nuevoProducto = await productoService.crear(req.body);
            return successResponse(res, nuevoProducto, 201);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const id = Number(req.params.id);
            const productoActualizado = await productoService.actualizar(id, req.body);
            return successResponse(res, productoActualizado);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            const id = Number(req.params.id);
            await productoService.eliminar(id);
            return successResponse(res, null);
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductoController();
