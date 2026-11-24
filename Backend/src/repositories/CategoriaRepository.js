import { db } from '../config/firebase.js';
import Categoria from '../models/Categoria.js';
import contadorRepository from './ContadorRepository.js';
import { ejecutarTransaccion, leer } from './transacciones.js';
import { Colecciones } from '../enums/Colecciones.js';

// Convierte entre la clase Categoria y el documento categorias/{id}.
// Los productos guardan el nombre de su categoría, así el catálogo se lee sin consultas extra.
const convertidor = {
    toFirestore(categoria) {
        return { id: categoria.id, nombre: categoria.nombre };
    },
    fromFirestore(documento) {
        const { id, nombre } = documento.data();
        return new Categoria(id, nombre);
    }
};

const coleccion = db.collection(Colecciones.CATEGORIAS).withConverter(convertidor);
const referencia = (id) => coleccion.doc(String(id));

class CategoriaRepository {
    async findAll() {
        const resultado = await coleccion.orderBy('id').get();
        return resultado.docs.map((documento) => documento.data());
    }

    async findByNombre(nombre, tx) {
        const consulta = coleccion.where('nombre', '==', nombre).limit(1);
        const resultado = await leer(consulta, tx);
        return resultado.empty ? null : resultado.docs[0].data();
    }

    async create(categoria, tx) {
        if (!tx) {
            return ejecutarTransaccion((nuevaTx) => this.create(categoria, nuevaTx));
        }
        categoria.id = await contadorRepository.siguienteId(Colecciones.CATEGORIAS, tx);
        tx.set(referencia(categoria.id), categoria);
        return categoria;
    }
}

export default new CategoriaRepository();
