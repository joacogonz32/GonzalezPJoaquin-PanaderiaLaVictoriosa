import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/ApiResponse.js';

export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
    }

    // JSON mal formado en el cuerpo de la solicitud (lanzado por express.json()).
    if (error.type === 'entity.parse.failed') {
        return errorResponse(res, Messages.INVALID_JSON, 400);
    }

    console.error(error);
    return errorResponse(res, Messages.INTERNAL_SERVER_ERROR, 500);
}
