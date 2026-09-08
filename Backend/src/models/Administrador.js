import Usuario from './Usuario.js';

class Administrador extends Usuario {
    constructor(id, nombre, email, contrasena, telefono) {
        super(id, nombre, email, contrasena, telefono);
    }
}

export default Administrador;
