import pedidoService from '../services/PedidoService.js';
import { successResponse } from '../responses/ApiResponse.js';

class PedidoController {
    crear(req, res, next) {
        try {
            const pedido = pedidoService.crear(req.usuario.id, req.body);
            return successResponse(res, pedido, 201);
        } catch (error) {
            next(error);
        }
    }

    obtenerTodos(req, res, next) {
        try {
            const { estado, tipo } = req.query;
            const pedidos = pedidoService.obtenerTodos({ estado, tipo });
            return successResponse(res, pedidos);
        } catch (error) {
            next(error);
        }
    }

    obtenerMisPedidos(req, res, next) {
        try {
            const pedidos = pedidoService.obtenerDeCliente(req.usuario.id);
            return successResponse(res, pedidos);
        } catch (error) {
            next(error);
        }
    }

    obtenerPorId(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = pedidoService.obtenerPorId(id, req.usuario);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }

    avanzarEstado(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = pedidoService.avanzarEstado(id);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }

    cancelar(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pedido = pedidoService.cancelar(id, req.usuario);
            return successResponse(res, pedido);
        } catch (error) {
            next(error);
        }
    }
}

export default new PedidoController();
