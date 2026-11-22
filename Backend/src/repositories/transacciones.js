import { db } from '../config/firebase.js';

// Ejecuta `operacion(tx)` dentro de una transacción de Firestore: todas las lecturas
// y escrituras se aplican juntas o no se aplica ninguna. Si dos requests modifican
// los mismos documentos a la vez, Firestore reintenta la operación con los datos nuevos.
// Regla de Firestore: dentro de una transacción, todas las lecturas van antes que las escrituras.
export function ejecutarTransaccion(operacion) {
    return db.runTransaction(operacion);
}

// Lee un documento o una consulta, dentro de la transacción si se recibe una.
export function leer(referencia, tx) {
    return tx ? tx.get(referencia) : referencia.get();
}

// Aplica `set` o `update` dentro de la transacción si se recibe una; si no, directamente.
export async function escribir(tx, operacion, referencia, datos) {
    if (tx) {
        tx[operacion](referencia, datos);
    } else {
        await referencia[operacion](datos);
    }
}
