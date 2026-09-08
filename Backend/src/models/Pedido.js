class Pedido {
    constructor(id, cliente, fecha, tipo, estado, total, fechaRetiro = null, montoSenia = null) {
        this.id = id;
        this.cliente = cliente;
        this.fecha = fecha;
        this.tipo = tipo;
        this.estado = estado;
        this.total = total;
        this.fechaRetiro = fechaRetiro;
        this.montoSenia = montoSenia;
    }
}

export default Pedido;
