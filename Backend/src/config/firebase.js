import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RAIZ_BACKEND } from './env.js';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Colecciones } from '../enums/Colecciones.js';

const PROYECTO_EMULADOR_POR_DEFECTO = 'demo-la-victoriosa';
const TIEMPO_MAXIMO_CONEXION_MS = 10000;

function finalizarConError(mensaje) {
    console.error(`\n[Firebase] ${mensaje}\nRevisá la sección "Base de datos" del README.\n`);
    process.exit(1);
}

// Con FIRESTORE_EMULATOR_HOST se usa el emulador local (no requiere credenciales).
// Si no, se usa el proyecto real con la clave de la cuenta de servicio.
function crearApp() {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        // Sin credenciales, la librería de Google intenta detectar si corre en Google Cloud
        // y muestra una advertencia. Con el emulador no hace falta.
        process.env.METADATA_SERVER_DETECTION ??= 'none';
        return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || PROYECTO_EMULADOR_POR_DEFECTO });
    }

    const rutaCredenciales = process.env.FIREBASE_CREDENTIALS_PATH;
    if (!rutaCredenciales) {
        finalizarConError('Falta la variable FIREBASE_CREDENTIALS_PATH en Backend/.env.');
    }

    const rutaAbsoluta = resolve(RAIZ_BACKEND, rutaCredenciales);
    if (!existsSync(rutaAbsoluta)) {
        finalizarConError(`No se encontró el archivo de credenciales: ${rutaAbsoluta}`);
    }

    let credenciales;
    try {
        credenciales = JSON.parse(readFileSync(rutaAbsoluta, 'utf8'));
    } catch {
        finalizarConError(`El archivo de credenciales no es un JSON válido: ${rutaAbsoluta}`);
    }
    return initializeApp({ credential: cert(credenciales) });
}

export const db = getFirestore(crearApp());

// Comprueba al iniciar que la base responde, para no descubrir el problema en la primera request.
// Devuelve true si la base ya tiene datos cargados.
export async function verificarConexion() {
    let temporizador;
    const limite = new Promise((_, reject) => {
        temporizador = setTimeout(
            () => reject(new Error('La base de datos no respondió a tiempo.')),
            TIEMPO_MAXIMO_CONEXION_MS
        );
    });

    try {
        const consulta = db.collection(Colecciones.PRODUCTOS).limit(1).get();
        const resultado = await Promise.race([consulta, limite]);
        return !resultado.empty;
    } finally {
        clearTimeout(temporizador);
    }
}
