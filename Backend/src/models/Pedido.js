class Pedido {
    constructor(id, clienteId, fecha, tipo, estado, total, detalles = [], fechaRetiro = null, montoSenia = null) {
        this.id = id;
        this.clienteId = clienteId;
        this.fecha = fecha;
        this.tipo = tipo;
        this.estado = estado;
        this.total = total;
        this.detalles = detalles;
        this.fechaRetiro = fechaRetiro;
        this.montoSenia = montoSenia;
    }
}

export default Pedido;
