import { Router } from 'express';
import productoRoutes from './productoRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/productos', productoRoutes);
router.use('/auth', authRoutes);

export default router;
