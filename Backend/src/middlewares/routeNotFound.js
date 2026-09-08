import { Messages } from '../enums/Messages.js';
import { errorResponse } from '../responses/ApiResponse.js';

export function routeNotFound(req, res) {
    return errorResponse(res, Messages.ROUTE_NOT_FOUND, 404);
}
