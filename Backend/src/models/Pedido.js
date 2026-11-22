class Pedido {
    constructor(
        id, clienteId, fecha, tipo, estado, total, detalles = [],
        fechaRetiro = null, montoSenia = null, pagoSenia = null
    ) {
        this.id = id;
        this.clienteId = clienteId;
        this.fecha = fecha;
        this.tipo = tipo;
        this.estado = estado;
        this.total = total;
        this.detalles = detalles;
        this.fechaRetiro = fechaRetiro;
        this.montoSenia = montoSenia;
        this.pagoSenia = pagoSenia; // PagoSenia o null mientras no se haya pagado
    }
}

export default Pedido;
