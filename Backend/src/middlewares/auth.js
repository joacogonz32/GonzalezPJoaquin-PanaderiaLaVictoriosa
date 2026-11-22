import authService from '../services/AuthService.js';
import { UnauthorizedError, ForbiddenError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';

// Lee el token "Authorization: Bearer <token>" y deja el usuario en req.usuario.
export async function autenticar(req, res, next) {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
        return next(new UnauthorizedError(Messages.AUTH_REQUIRED));
    }

    try {
        req.usuario = await authService.obtenerUsuarioPorToken(token);
        req.token = token;
    } catch (error) {
        return next(error);
    }
    next();
}

// Restringe la ruta a los roles indicados. Debe usarse después de autenticar.
export function autorizar(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return next(new ForbiddenError(Messages.FORBIDDEN));
        }
        next();
    };
}
