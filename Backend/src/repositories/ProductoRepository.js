import { db } from '../config/firebase.js';
import Producto from '../models/Producto.js';
import contadorRepository from './ContadorRepository.js';
import { ejecutarTransaccion, escribir, leer } from './transacciones.js';
import { Colecciones } from '../enums/Colecciones.js';

// Firestore no compara sin distinguir mayúsculas: se guarda el nombre normalizado
// para poder detectar duplicados como "Pan francés" y "pan francés".
const normalizarNombre = (nombre) => nombre.trim().toLowerCase();

// Convierte entre la clase Producto y el documento productos/{id}.
const convertidor = {
    toFirestore(producto) {
        return {
            id: producto.id,
            nombre: producto.nombre,
            nombreNormalizado: normalizarNombre(producto.nombre),
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            categoria: producto.categoria,
            destacado: producto.destacado,
            porEncargo: producto.porEncargo
        };
    },
    fromFirestore(documento) {
        const datos = documento.data();
        return new Producto(
            datos.id, datos.nombre, datos.descripcion, datos.precio,
            datos.stock, datos.categoria, datos.destacado, datos.porEncargo
        );
    }
};

const coleccion = db.collection(Colecciones.PRODUCTOS).withConverter(convertidor);
const referencia = (id) => coleccion.doc(String(id));

// Todos los métodos aceptan una transacción opcional (`tx`) para que el service
// pueda combinar varias operaciones de forma atómica (por ejemplo, crear un pedido y descontar stock).
class ProductoRepository {
    async findAll() {
        const resultado = await coleccion.orderBy('id').get();
        return resultado.docs.map((documento) => documento.data());
    }

    async findById(id, tx) {
        const documento = await leer(referencia(id), tx);
        return documento.exists ? documento.data() : null;
    }

    // Busca varios productos en una sola lectura. Devuelve un Map id -> producto
    // (los que ya no existen no aparecen).
    async findByIds(ids) {
        const unicos = [...new Set(ids)];
        if (unicos.length === 0) {
            return new Map();
        }
        const documentos = await db.getAll(...unicos.map(referencia));
        return new Map(
            documentos
                .filter((documento) => documento.exists)
                .map((documento) => [documento.data().id, documento.data()])
        );
    }

    async findByNombre(nombre, tx) {
        const consulta = coleccion.where('nombreNormalizado', '==', normalizarNombre(nombre)).limit(1);
        const resultado = await leer(consulta, tx);
        return resultado.empty ? null : resultado.docs[0].data();
    }

    async create(producto, tx) {
        if (!tx) {
            return ejecutarTransaccion((nuevaTx) => this.create(producto, nuevaTx));
        }
        producto.id = await contadorRepository.siguienteId(Colecciones.PRODUCTOS, tx);
        tx.set(referencia(producto.id), producto);
        return producto;
    }

    async update(id, datosActualizados, tx) {
        if (Object.keys(datosActualizados).length === 0) {
            return;
        }
        const datos = { ...datosActualizados };
        if (datos.nombre !== undefined) {
            datos.nombreNormalizado = normalizarNombre(datos.nombre);
        }
        await escribir(tx, 'update', referencia(id), datos);
    }

    async delete(id) {
        await referencia(id).delete();
    }
}

export default new ProductoRepository();
