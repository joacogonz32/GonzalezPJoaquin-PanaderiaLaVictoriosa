import Usuario from './Usuario.js';

class Cliente extends Usuario {
    constructor(id, nombre, email, contrasena, telefono) {
        super(id, nombre, email, contrasena, telefono);
    }
}

export default Cliente;
