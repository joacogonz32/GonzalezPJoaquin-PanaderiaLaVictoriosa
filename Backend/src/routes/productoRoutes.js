import { Router } from 'express';
import productoController from '../controllers/ProductoController.js';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';
import { Roles } from '../enums/Roles.js';

const router = Router();
const soloAdministrador = [autenticar, autorizar(Roles.ADMINISTRADOR)];

// Consulta pública del catálogo
router.get('/', productoController.obtenerTodos);
router.get('/categorias', productoController.obtenerCategorias);
router.get('/:id', validarId, productoController.obtenerPorId);

// Solo el administrador modifica productos, precios y stock
router.post('/', soloAdministrador, productoController.crear);
router.put('/:id', soloAdministrador, validarId, productoController.actualizar);
router.delete('/:id', soloAdministrador, validarId, productoController.eliminar);

export default router;
