import { Router } from 'express';
import productoController from '../controllers/ProductoController.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.get('/', productoController.obtenerTodos);
router.get('/categorias', productoController.obtenerCategorias);
router.get('/:id', validarId, productoController.obtenerPorId);
router.post('/', productoController.crear);
router.put('/:id', validarId, productoController.actualizar);
router.delete('/:id', validarId, productoController.eliminar);

export default router;
