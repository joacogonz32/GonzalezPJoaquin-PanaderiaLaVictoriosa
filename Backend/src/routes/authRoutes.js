import { Router } from 'express';
import authController from '../controllers/AuthController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/registro', authController.registrar);
router.post('/login', authController.login);
router.post('/logout', autenticar, authController.logout);
router.get('/perfil', autenticar, authController.perfil);

export default router;
