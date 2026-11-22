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

// Medios con los que el cliente puede abonar (simuladamente) la seña de un encargo.
export const MediosPago = Object.freeze({
    TRANSFERENCIA: "Transferencia",
    MERCADO_PAGO: "Mercado Pago",
    TARJETA: "Tarjeta"
});

export const MEDIOS_PAGO_VALIDOS = Object.freeze(Object.values(MediosPago));

// Reglas de negocio parametrizables
export const ReglasPedido = Object.freeze({
    HORAS_ANTICIPACION_ENCARGO: 48,
    PORCENTAJE_SENIA: 0.5
});
