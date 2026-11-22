import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/ApiResponse.js';

// Códigos gRPC que devuelve Firestore cuando no se puede comunicar con la base.
const CODIGOS_BASE_NO_DISPONIBLE = [4, 14]; // DEADLINE_EXCEEDED, UNAVAILABLE

export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
    }

    // JSON mal formado en el cuerpo de la solicitud (lanzado por express.json()).
    if (error.type === 'entity.parse.failed') {
        return errorResponse(res, Messages.INVALID_JSON, 400);
    }

    if (CODIGOS_BASE_NO_DISPONIBLE.includes(error.code)) {
        console.error(error);
        return errorResponse(res, Messages.DATABASE_UNAVAILABLE, 503);
    }

    console.error(error);
    return errorResponse(res, Messages.INTERNAL_SERVER_ERROR, 500);
}
