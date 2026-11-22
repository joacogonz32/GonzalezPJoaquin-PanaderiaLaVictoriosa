import { db } from '../config/firebase.js';
import Cliente from '../models/Cliente.js';
import Administrador from '../models/Administrador.js';
import contadorRepository from './ContadorRepository.js';
import { ejecutarTransaccion, leer } from './transacciones.js';
import { Colecciones } from '../enums/Colecciones.js';
import { Roles } from '../enums/Roles.js';

const normalizarEmail = (email) => email.trim().toLowerCase();

// Convierte entre las clases Cliente/Administrador y el documento usuarios/{id}.
// El campo `rol` indica qué subclase de Usuario se reconstruye.
const convertidor = {
    toFirestore(usuario) {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: normalizarEmail(usuario.email),
            contrasena: usuario.contrasena,
            telefono: usuario.telefono,
            rol: usuario.rol
        };
    },
    fromFirestore(documento) {
        const { id, nombre, email, contrasena, telefono, rol } = documento.data();
        const Clase = rol === Roles.ADMINISTRADOR ? Administrador : Cliente;
        return new Clase(id, nombre, email, contrasena, telefono);
    }
};

const coleccion = db.collection(Colecciones.USUARIOS).withConverter(convertidor);
const referencia = (id) => coleccion.doc(String(id));

class UsuarioRepository {
    async findById(id, tx) {
        const documento = await leer(referencia(id), tx);
        return documento.exists ? documento.data() : null;
    }

    // Busca varios usuarios en una sola lectura. Devuelve un Map id -> usuario.
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

    async findByEmail(email, tx) {
        const consulta = coleccion.where('email', '==', normalizarEmail(email)).limit(1);
        const resultado = await leer(consulta, tx);
        return resultado.empty ? null : resultado.docs[0].data();
    }

    async create(usuario, tx) {
        if (!tx) {
            return ejecutarTransaccion((nuevaTx) => this.create(usuario, nuevaTx));
        }
        usuario.id = await contadorRepository.siguienteId(Colecciones.USUARIOS, tx);
        tx.set(referencia(usuario.id), usuario);
        return usuario;
    }
}

export default new UsuarioRepository();
