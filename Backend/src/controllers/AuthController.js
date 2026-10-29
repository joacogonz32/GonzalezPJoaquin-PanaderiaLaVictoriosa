import authService from '../services/AuthService.js';
import { successResponse } from '../responses/ApiResponse.js';

class AuthController {
    registrar(req, res, next) {
        try {
            const sesion = authService.registrar(req.body);
            return successResponse(res, sesion, 201);
        } catch (error) {
            next(error);
        }
    }

    login(req, res, next) {
        try {
            const sesion = authService.login(req.body);
            return successResponse(res, sesion);
        } catch (error) {
            next(error);
        }
    }

    logout(req, res, next) {
        try {
            authService.logout(req.token);
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
