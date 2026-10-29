export const TiposPedido = Object.freeze({
    REGULAR: "REGULAR",
    ENCARGO: "ENCARGO"
});

export const EstadosPedido = Object.freeze({
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    SENIA_CONFIRMADA: "Seña confirmada",
    EN_PREPARACION: "En preparación",
    LISTO_PARA_RETIRAR: "Listo para retirar",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado"
});

// Reglas de negocio parametrizables
export const ReglasPedido = Object.freeze({
    HORAS_ANTICIPACION_ENCARGO: 48,
    PORCENTAJE_SENIA: 0.5
});
