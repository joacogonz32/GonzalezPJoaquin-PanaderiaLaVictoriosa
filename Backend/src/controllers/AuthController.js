import authService from '../services/AuthService.js';
import { successResponse } from '../responses/ApiResponse.js';

class AuthController {
    async registrar(req, res, next) {
        try {
            const sesion = await authService.registrar(req.body);
            return successResponse(res, sesion, 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const sesion = await authService.login(req.body);
            return successResponse(res, sesion);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            await authService.logout(req.token);
            return successResponse(res, null);
        } catch (error) {
            next(error);
        }
    }

    perfil(req, res, next) {
        try {
            const usuario = authService.aDatosPublicos(req.usuario);
            return successResponse(res, usuario);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
