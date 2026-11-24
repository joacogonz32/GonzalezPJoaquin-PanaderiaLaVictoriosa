import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import Carrito from '../models/Carrito.js';
import ItemCarrito from '../models/ItemCarrito.js';
import { escribir, leer } from './transacciones.js';
import { Colecciones } from '../enums/Colecciones.js';

// Convierte entre la clase Carrito y el documento carritos/{clienteId}.
// El ID del documento es el del cliente: cada cliente tiene un único carrito.
const convertidor = {
    toFirestore(carrito) {
        return {
            clienteId: carrito.clienteId,
            items: carrito.items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
            actualizadoEn: FieldValue.serverTimestamp()
        };
    },
    fromFirestore(documento) {
        const { clienteId, items } = documento.data();
        return new Carrito(clienteId, items.map(({ productoId, cantidad }) => new ItemCarrito(productoId, cantidad)));
    }
};

const coleccion = db.collection(Colecciones.CARRITOS).withConverter(convertidor);
const referencia = (clienteId) => coleccion.doc(String(clienteId));

class CarritoRepository {
    async findByClienteId(clienteId, tx) {
        const documento = await leer(referencia(clienteId), tx);
        return documento.exists ? documento.data() : null;
    }

    // Reemplaza el carrito completo del cliente.
    async save(carrito, tx) {
        await escribir(tx, 'set', referencia(carrito.clienteId), carrito);
    }

    // Borrar un carrito que no existe no es un error: el resultado es el mismo.
    async delete(clienteId, tx) {
        await escribir(tx, 'delete', referencia(clienteId));
    }
}

export default new CarritoRepository();
