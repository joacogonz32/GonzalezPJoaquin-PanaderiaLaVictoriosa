import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// Carpeta raíz del backend, para resolver rutas relativas del .env sin importar
// desde qué carpeta se ejecute el proceso.
export const RAIZ_BACKEND = fileURLToPath(new URL('../../', import.meta.url));

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
