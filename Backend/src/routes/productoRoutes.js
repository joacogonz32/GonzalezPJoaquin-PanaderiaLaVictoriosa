import { Router } from 'express';
import productoController from '../controllers/ProductoController.js';

const router = Router();

router.get('/', productoController.obtenerTodos);
router.get('/:id', productoController.obtenerPorId);
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);

export default router;
