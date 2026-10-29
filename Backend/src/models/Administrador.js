import Usuario from './Usuario.js';
import { Roles } from '../enums/Roles.js';

class Administrador extends Usuario {
    constructor(id, nombre, email, contrasena, telefono) {
        super(id, nombre, email, contrasena, telefono, Roles.ADMINISTRADOR);
    }
}

export default Administrador;
