// Clase base del patrón Strategy: cada tipo de pedido define su flujo de estados
// y sus propias reglas de validación, stock y seña.
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

    puedeCancelarse(estadoActual) {
        return this.estadosCancelables.includes(estadoActual);
    }
}

export default PedidoStrategy;
