import { Router } from 'express';
import pedidoController from '../controllers/PedidoController.js';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

// Todas las operaciones de pedidos requieren sesión iniciada
router.use(autenticar);

router.get('/', autorizar(Roles.ADMINISTRADOR), pedidoController.obtenerTodos);
router.get('/mios', autorizar(Roles.CLIENTE), pedidoController.obtenerMisPedidos);
router.get('/:id', validarId, pedidoController.obtenerPorId);
router.post('/', autorizar(Roles.CLIENTE), pedidoController.crear);
router.patch('/:id/avanzar', autorizar(Roles.ADMINISTRADOR), validarId, pedidoController.avanzarEstado);
router.patch('/:id/cancelar', validarId, pedidoController.cancelar);

export default router;
