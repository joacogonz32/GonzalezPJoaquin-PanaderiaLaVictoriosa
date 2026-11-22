import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { Colecciones } from '../enums/Colecciones.js';

// Sesiones activas: sesiones/{token} = { usuarioId, creadaEn }.
// Al guardarse en la base, las sesiones siguen siendo válidas aunque se reinicie el servidor.
const referencia = (token) => db.collection(Colecciones.SESIONES).doc(token);

class SesionRepository {
    async create(token, usuarioId) {
        await referencia(token).set({ usuarioId, creadaEn: FieldValue.serverTimestamp() });
    }

    async findUsuarioId(token) {
        const documento = await referencia(token).get();
        return documento.exists ? documento.data().usuarioId : null;
    }

    async delete(token) {
        await referencia(token).delete();
    }
}

export default new SesionRepository();
