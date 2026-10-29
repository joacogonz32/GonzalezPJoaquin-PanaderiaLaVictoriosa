import { BadRequestError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { isPositiveInteger } from '../utils/validators.js';

// Verifica que el parámetro :id de la ruta sea un entero positivo.
export function validarId(req, res, next) {
    if (!/^\d+$/.test(req.params.id) || !isPositiveInteger(Number(req.params.id))) {
        return next(new BadRequestError(Messages.INVALID_ID));
    }
    next();
}
