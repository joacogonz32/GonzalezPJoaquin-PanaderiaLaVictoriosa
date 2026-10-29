// Sesiones activas en memoria: token -> id del usuario.
const sesiones = new Map();

class SesionRepository {
    create(token, usuarioId) {
        sesiones.set(token, usuarioId);
    }

    findUsuarioId(token) {
        return sesiones.get(token);
    }

    delete(token) {
        sesiones.delete(token);
    }
}

export default new SesionRepository();
