import pedidoService from '../services/PedidoService.js';
import { successResponse } from '../responses/ApiResponse.js';

class PedidoController {
    async crear(req, res, next) {
        try {
            const pedido = await pedidoService.crear(req.usuario.id, req.body);
            return successResponse(res, pedido, 201);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodos(req, res, next) {
        try {
            const { estado, tipo } = req.query;
            const pedidos = await pedidoService.obtenerTodos({ estado, tipo });
            return successResponse(res, pedidos);
        } catch (error) {
            next(error);
        }
    }

    async obtenerMisPedidos(req, res, next) {
        try {
            const pedidos = await pedidoService.obtenerDeCliente(req.usuario.id);
            return successResponse(res, pedidos);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = await pedidoService.obtenerPorId(id, req.usuario);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }

    async avanzarEstado(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = await pedidoService.avanzarEstado(id);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }

    async pagarSenia(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = await pedidoService.pagarSenia(id, req.usuario, req.body);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }

    async cancelar(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = await pedidoService.cancelar(id, req.usuario);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }
}

export default new PedidoController();
