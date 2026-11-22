import app from './src/app.js';
import { verificarConexion } from './src/config/firebase.js';

const PORT = process.env.PORT || 3000;

try {
    const hayDatos = await verificarConexion();
    if (!hayDatos) {
        console.warn('[Firebase] La base de datos está vacía. Ejecutá "npm run seed" para cargar el catálogo y el administrador.');
    }
} catch (error) {
    console.error(`\n[Firebase] No se pudo conectar con Firestore: ${error.message}\nRevisá la sección "Base de datos" del README.\n`);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
