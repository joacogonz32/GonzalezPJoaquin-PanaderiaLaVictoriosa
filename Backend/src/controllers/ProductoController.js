import productoService from '../services/ProductoService.js';
import { successResponse } from '../responses/ApiResponse.js';

class ProductoController {
    obtenerTodos(req, res, next) {
        try {
            const productos = productoService.obtenerTodos();
            return successResponse(res, productos);
        } catch (error) {
            next(error);
        }
    }

    obtenerPorId(req, res, next) {
        try {
            const id = Number(req.params.id);
            const producto = productoService.obtenerPorId(id);
            return successResponse(res, producto);
        } catch (error) {
            next(error);
        }
    }

    crear(req, res, next) {
        try {
            const nuevoProducto = productoService.crear(req.body);
            return successResponse(res, nuevoProducto, 201);
        } catch (error) {
            next(error);
        }
    }

    actualizar(req, res, next) {
        try {
            const id = Number(req.params.id);
            const productoActualizado = productoService.actualizar(id, req.body);
            return successResponse(res, productoActualizado);
        } catch (error) {
            next(error);
        }
    }

    eliminar(req, res, next) {
        try {
            const id = Number(req.params.id);
            productoService.eliminar(id);
            return successResponse(res, null);
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductoController();
