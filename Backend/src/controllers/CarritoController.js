import carritoService from '../services/CarritoService.js';
import { successResponse } from '../responses/ApiResponse.js';

class CarritoController {
    async obtener(req, res, next) {
        try {
            const carrito = await carritoService.obtener(req.usuario.id);
            return successResponse(res, carrito);
        } catch (error) {
            next(error);
        }
    }

    async guardar(req, res, next) {
        try {
            const carrito = await carritoService.guardar(req.usuario.id, req.body);
            return successResponse(res, carrito);
        } catch (error) {
            next(error);
        }
    }

    async vaciar(req, res, next) {
        try {
            await carritoService.vaciar(req.usuario.id);
            return successResponse(res, null);
        } catch (error) {
            next(error);
        }
    }
}

export default new CarritoController();
