// Clase base del patrón Strategy: cada tipo de pedido define su flujo de estados
// y sus propias reglas de validación, stock, seña y cancelación.
class PedidoStrategy {
    constructor(flujo, estadosCancelables) {
        this.flujo = flujo;
        this.estadosCancelables = estadosCancelables;
    }

    // Valida las reglas propias del tipo. Recibe los detalles ya resueltos
    // ({ producto, cantidad }) y la fecha de retiro parseada (o null).
    validar(_items, _fechaRetiro) {
        throw new Error('validar() debe implementarse en la estrategia concreta.');
    }

    // Indica si el pedido descuenta stock del catálogo al crearse.
    afectaStock() {
        return false;
    }

    calcularSenia(_total) {
        return null;
    }

    estadoInicial() {
        return this.flujo[0];
    }

    siguienteEstado(estadoActual) {
        const index = this.flujo.indexOf(estadoActual);
        if (index === -1 || index === this.flujo.length - 1) {
            return null;
        }
        return this.flujo[index + 1];
    }

    // Indica si el administrador puede pasar el pedido al siguiente estado.
    puedeAvanzarManualmente(estadoActual) {
        return this.siguienteEstado(estadoActual) !== null;
    }

    // Indica si el usuario con el rol indicado puede cancelar el pedido en este estado.
    puedeCancelarse(estadoActual, _rol) {
        return this.estadosCancelables.includes(estadoActual);
    }

    // Indica si el pedido tiene una seña pendiente de pago.
    puedePagarSenia(_estadoActual) {
        return false;
    }
}

export default PedidoStrategy;
