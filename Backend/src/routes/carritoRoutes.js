import { Router } from 'express';
import carritoController from '../controllers/CarritoController.js';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { Roles } from '../enums/Roles.js';

const router = Router();

// Cada cliente accede solo a su propio carrito (se identifica por el token)
router.use(autenticar, autorizar(Roles.CLIENTE));

router.get('/', carritoController.obtener);
router.put('/', carritoController.guardar);
router.delete('/', carritoController.vaciar);

export default router;
