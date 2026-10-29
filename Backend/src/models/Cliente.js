import Usuario from './Usuario.js';
import { Roles } from '../enums/Roles.js';

class Cliente extends Usuario {
    constructor(id, nombre, email, contrasena, telefono) {
        super(id, nombre, email, contrasena, telefono, Roles.CLIENTE);
    }
}

export default Cliente;
