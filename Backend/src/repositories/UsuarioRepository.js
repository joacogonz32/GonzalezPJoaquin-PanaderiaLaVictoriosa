import Cliente from '../models/Cliente.js';
import Administrador from '../models/Administrador.js';
import { createIdGenerator } from '../utils/idGenerator.js';
import { hashPassword } from '../utils/password.js';
import { administradoresIniciales, clientesIniciales } from '../data/usuarios.js';

const usuarios = [];
const generateId = createIdGenerator(1);

class UsuarioRepository {
    constructor() {
        for (const datos of administradoresIniciales) {
            this.create(new Administrador(null, datos.nombre, datos.email, hashPassword(datos.contrasena), datos.telefono));
        }
        for (const datos of clientesIniciales) {
            this.create(new Cliente(null, datos.nombre, datos.email, hashPassword(datos.contrasena), datos.telefono));
        }
    }

    findById(id) {
        return usuarios.find((usuario) => usuario.id === id);
    }

    findByEmail(email) {
        return usuarios.find(
            (usuario) => usuario.email.toLowerCase() === email.toLowerCase()
        );
    }

    create(usuario) {
        usuario.id = generateId();
        usuarios.push(usuario);
        return usuario;
    }
}

export default new UsuarioRepository();
