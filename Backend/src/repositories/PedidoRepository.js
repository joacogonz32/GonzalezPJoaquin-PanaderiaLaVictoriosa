import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import Pedido from '../models/Pedido.js';
import DetallePedido from '../models/DetallePedido.js';
import contadorRepository from './ContadorRepository.js';
import { ejecutarTransaccion, escribir, leer } from './transacciones.js';
import { Colecciones } from '../enums/Colecciones.js';

// En Firestore las fechas se guardan como Timestamp; en el resto del sistema, como texto ISO 8601.
const aTimestamp = (fechaIso) => (fechaIso ? Timestamp.fromDate(new Date(fechaIso)) : null);
const aFechaIso = (timestamp) => (timestamp ? timestamp.toDate().toISOString() : null);

// Convierte entre la clase Pedido (con sus DetallePedido) y el documento pedidos/{id}.
// Los detalles se guardan dentro del mismo documento porque siempre se leen junto con el pedido.
const convertidor = {
    toFirestore(pedido) {
        return {
            id: pedido.id,
            clienteId: pedido.clienteId,
            fecha: aTimestamp(pedido.fecha),
            tipo: pedido.tipo,
            estado: pedido.estado,
            total: pedido.total,
            detalles: pedido.detalles.map((detalle) => ({
                productoId: detalle.productoId,
                nombreProducto: detalle.nombreProducto,
                precioUnitario: detalle.precioUnitario,
                cantidad: detalle.cantidad,
                subtotal: detalle.subtotal
            })),
            fechaRetiro: aTimestamp(pedido.fechaRetiro),
            montoSenia: pedido.montoSenia
        };
    },
    fromFirestore(documento) {
        const datos = documento.data();
        const detalles = datos.detalles.map((detalle) => new DetallePedido(
            detalle.productoId, detalle.nombreProducto, detalle.precioUnitario, detalle.cantidad
        ));
        return new Pedido(
            datos.id, datos.clienteId, aFechaIso(datos.fecha), datos.tipo, datos.estado,
            datos.total, detalles, aFechaIso(datos.fechaRetiro), datos.montoSenia
        );
    }
};

const coleccion = db.collection(Colecciones.PEDIDOS).withConverter(convertidor);
const referencia = (id) => coleccion.doc(String(id));
const aLista = (resultado) => resultado.docs.map((documento) => documento.data());

class PedidoRepository {
    // Filtros opcionales por igualdad: no requieren índices compuestos en Firestore.
    async findAll({ estado, tipo } = {}) {
        let consulta = coleccion;
        if (estado) consulta = consulta.where('estado', '==', estado);
        if (tipo) consulta = consulta.where('tipo', '==', tipo);
        return aLista(await consulta.get());
    }

    async findById(id, tx) {
        const documento = await leer(referencia(id), tx);
        return documento.exists ? documento.data() : null;
    }

    async findByClienteId(clienteId) {
        return aLista(await coleccion.where('clienteId', '==', clienteId).get());
    }

    async create(pedido, tx) {
        if (!tx) {
            return ejecutarTransaccion((nuevaTx) => this.create(pedido, nuevaTx));
        }
        pedido.id = await contadorRepository.siguienteId(Colecciones.PEDIDOS, tx);
        tx.set(referencia(pedido.id), pedido);
        return pedido;
    }

    async update(id, datosActualizados, tx) {
        await escribir(tx, 'update', referencia(id), datosActualizados);
    }
}

export default new PedidoRepository();
