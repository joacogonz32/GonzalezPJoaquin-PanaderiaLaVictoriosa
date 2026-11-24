import { Router } from 'express';
import productoRoutes from './productoRoutes.js';
import authRoutes from './authRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import carritoRoutes from './carritoRoutes.js';

const router = Router();

router.use('/productos', productoRoutes);
router.use('/auth', authRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/carrito', carritoRoutes);

export default router;
