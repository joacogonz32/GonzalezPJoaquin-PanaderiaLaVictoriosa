import { db } from '../config/firebase.js';
import { Colecciones } from '../enums/Colecciones.js';

// Genera IDs numéricos consecutivos (1, 2, 3…) con un documento por colección:
// contadores/{coleccion} = { ultimoId }. Se usa siempre dentro de una transacción,
// así dos altas simultáneas nunca obtienen el mismo ID.
class ContadorRepository {
    #referencia(coleccion) {
        return db.collection(Colecciones.CONTADORES).doc(coleccion);
    }

    // Lee y escribe el contador: debe llamarse después de las demás lecturas de la transacción.
    async siguienteId(coleccion, tx) {
        const referencia = this.#referencia(coleccion);
        const documento = await tx.get(referencia);
        const siguiente = (documento.exists ? documento.data().ultimoId : 0) + 1;
        tx.set(referencia, { ultimoId: siguiente });
        return siguiente;
    }
}

export default new ContadorRepository();
