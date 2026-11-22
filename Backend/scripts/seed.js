// Carga los datos iniciales en Firestore: el catálogo de productos y la cuenta de administrador.
//
//   npm run seed              → carga los datos solo si la base está vacía
//   npm run seed -- --reset   → BORRA toda la base (productos, usuarios, pedidos y sesiones) y la vuelve a cargar
//
// Las credenciales del administrador se leen de Backend/.env (SEED_ADMIN_*), para que no queden en el repositorio.
// Los clientes no se cargan acá: se registran desde la web.
import { db } from '../src/config/firebase.js';
import Producto from '../src/models/Producto.js';
import Administrador from '../src/models/Administrador.js';
import productoRepository from '../src/repositories/ProductoRepository.js';
import usuarioRepository from '../src/repositories/UsuarioRepository.js';
import { productosIniciales } from '../src/data/productos.js';
import { Colecciones } from '../src/enums/Colecciones.js';
import { hashPassword } from '../src/utils/password.js';
import { countDigits, isNonEmptyString, isValidEmail } from '../src/utils/validators.js';

const reiniciar = process.argv.includes('--reset');

function leerAdministrador() {
    const {
        SEED_ADMIN_NOMBRE = 'Administración La Victoriosa',
        SEED_ADMIN_EMAIL,
        SEED_ADMIN_PASSWORD,
        SEED_ADMIN_TELEFONO = '+54 11 4521-2319'
    } = process.env;

    const errores = [];
    if (!isNonEmptyString(SEED_ADMIN_EMAIL) || !isValidEmail(SEED_ADMIN_EMAIL)) {
        errores.push('SEED_ADMIN_EMAIL debe ser un email válido.');
    }
    if (!isNonEmptyString(SEED_ADMIN_PASSWORD) || SEED_ADMIN_PASSWORD.length < 6) {
        errores.push('SEED_ADMIN_PASSWORD debe tener al menos 6 caracteres.');
    }
    if (countDigits(SEED_ADMIN_TELEFONO) < 8) {
        errores.push('SEED_ADMIN_TELEFONO debe tener al menos 8 dígitos.');
    }
    if (errores.length > 0) {
        throw new Error(`Revisá los datos del administrador en Backend/.env:\n  - ${errores.join('\n  - ')}`);
    }

    return new Administrador(
        null, SEED_ADMIN_NOMBRE.trim(), SEED_ADMIN_EMAIL.trim(), hashPassword(SEED_ADMIN_PASSWORD), SEED_ADMIN_TELEFONO.trim()
    );
}

async function baseTieneDatos() {
    const consultas = Object.values(Colecciones).map((nombre) => db.collection(nombre).limit(1).get());
    const resultados = await Promise.all(consultas);
    return resultados.some((resultado) => !resultado.empty);
}

async function vaciarBase() {
    for (const nombre of Object.values(Colecciones)) {
        await db.recursiveDelete(db.collection(nombre));
    }
}

async function main() {
    const administrador = leerAdministrador();

    if (await baseTieneDatos()) {
        if (!reiniciar) {
            console.log('La base ya tiene datos, no se cargó nada.');
            console.log('Para borrarla por completo y volver a cargarla: npm run seed -- --reset');
            return;
        }
        console.log('Borrando todos los datos (productos, usuarios, pedidos y sesiones)...');
        await vaciarBase();
    }

    // Se cargan de a uno para que los IDs respeten el orden del catálogo.
    for (const datos of productosIniciales) {
        await productoRepository.create(new Producto(
            null, datos.nombre, datos.descripcion, datos.precio,
            datos.stock, datos.categoria, datos.destacado, datos.porEncargo
        ));
    }
    await usuarioRepository.create(administrador);

    console.log(`Listo: ${productosIniciales.length} productos y la cuenta de administrador (${administrador.email}).`);
}

try {
    await main();
} catch (error) {
    console.error(`\nNo se pudo completar la carga inicial.\n${error.message}\n`);
    process.exitCode = 1;
} finally {
    await db.terminate();
}
