import AppError from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/ApiResponse.js';

export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
    }

    console.error(error);
    return errorResponse(res, Messages.INTERNAL_SERVER_ERROR, 500);
}
