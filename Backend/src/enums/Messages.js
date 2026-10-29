export const Messages = Object.freeze({
    // Generales
    INVALID_DATA: "Los datos enviados son inválidos.",
    INVALID_JSON: "El cuerpo de la solicitud no es un JSON válido.",
    INVALID_ID: "El identificador debe ser un número entero positivo.",
    DUPLICATED_RESOURCE: "El recurso ya existe.",
    ROUTE_NOT_FOUND: "La ruta solicitada no existe.",
    INTERNAL_SERVER_ERROR: "Ocurrió un error inesperado en el servidor.",

    // Productos
    PRODUCT_NOT_FOUND: "El producto no existe.",
    PRODUCT_NAME_REQUIRED: "El nombre del producto es obligatorio.",
    PRODUCT_NAME_DUPLICATED: "Ya existe un producto con ese nombre.",
    PRODUCT_INVALID_PRICE: "El precio debe ser un número mayor a cero.",
    PRODUCT_INVALID_STOCK: "El stock debe ser un número entero mayor o igual a cero.",
    PRODUCT_INVALID_CATEGORY: "La categoría del producto no es válida.",
    PRODUCT_INVALID_FLAG: "Los campos 'destacado' y 'porEncargo' deben ser verdadero o falso.",

    // Autenticación y usuarios
    USER_NOT_FOUND: "El usuario no existe.",
    USER_REQUIRED_FIELDS: "Nombre, email, contraseña y teléfono son obligatorios.",
    USER_INVALID_EMAIL: "El formato del email no es válido.",
    USER_INVALID_PHONE: "El teléfono debe tener al menos 8 dígitos.",
    USER_SHORT_PASSWORD: "La contraseña debe tener al menos 6 caracteres.",
    USER_EMAIL_DUPLICATED: "Ya existe un usuario registrado con ese email.",
    LOGIN_REQUIRED_FIELDS: "El email y la contraseña son obligatorios.",
    INVALID_CREDENTIALS: "El email o la contraseña son incorrectos.",
    AUTH_REQUIRED: "Debés iniciar sesión para realizar esta operación.",
    INVALID_SESSION: "La sesión no es válida o expiró. Volvé a iniciar sesión.",
    FORBIDDEN: "No tenés permisos para realizar esta operación.",

    // Pedidos
    ORDER_NOT_FOUND: "El pedido no existe.",
    ORDER_INVALID_TYPE: "El tipo de pedido no es válido.",
    ORDER_EMPTY: "El pedido debe incluir al menos un producto.",
    ORDER_INVALID_ITEM: "Cada producto del pedido debe tener un identificador y una cantidad entera mayor a cero.",
    ORDER_DUPLICATED_ITEM: "Un mismo producto no puede aparecer más de una vez en el pedido.",
    ORDER_ITEM_ONLY_ENCARGO: (nombre) => `"${nombre}" solo se vende por encargo. Solicitalo como Encargo Especial.`,
    ORDER_INSUFFICIENT_STOCK: (nombre, disponible) => `No hay stock suficiente de "${nombre}". Disponible: ${disponible}.`,
    ORDER_PICKUP_DATE_REQUIRED: "La fecha de retiro es obligatoria para un Encargo Especial.",
    ORDER_INVALID_PICKUP_DATE: "La fecha de retiro no es válida.",
    ORDER_PICKUP_TOO_SOON: (horas) => `Los encargos deben solicitarse con al menos ${horas} horas de anticipación.`,
    ORDER_CANNOT_CANCEL: "El pedido ya no puede cancelarse porque está en preparación o en un estado posterior.",
    ORDER_FINAL_STATE: "El pedido ya se encuentra en un estado final y no puede avanzar."
});

export default Messages;
