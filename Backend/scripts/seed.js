// Carga los datos iniciales en Firestore: las categorías, el catálogo de productos y la cuenta de administrador.
//
//   npm run seed              → carga los datos si la base está vacía; si ya tiene datos, solo agrega
//                               las categorías cuando falta esa colección (bases creadas antes de existir)
//   npm run seed -- --reset   → BORRA toda la base (productos, categorías, usuarios, pedidos y sesiones)
//                               y la vuelve a cargar
//
// Las credenciales del administrador se leen de Backend/.env (SEED_ADMIN_*), para que no queden en el repositorio.
// Los clientes no se cargan acá: se registran desde la web.
import { db } from '../src/config/firebase.js';
import Producto from '../src/models/Producto.js';
import Administrador from '../src/models/Administrador.js';
import Categoria from '../src/models/Categoria.js';
import productoRepository from '../src/repositories/ProductoRepository.js';
import usuarioRepository from '../src/repositories/UsuarioRepository.js';
import categoriaRepository from '../src/repositories/CategoriaRepository.js';
import { productosIniciales } from '../src/data/productos.js';
import { categoriasIniciales } from '../src/data/categorias.js';
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

// Se cargan de a una para que los IDs respeten el orden de la lista.
async function cargarCategorias(nombres) {
    for (const nombre of nombres) {
        await categoriaRepository.create(new Categoria(null, nombre));
    }
}

// Para una base que ya tiene productos pero no la colección "categorias":
// carga las iniciales más cualquier otra que usen los productos existentes.
async function completarCategorias() {
    if ((await categoriaRepository.findAll()).length > 0) {
        return 0;
    }
    const productos = await productoRepository.findAll();
    const nombres = [...new Set([...categoriasIniciales, ...productos.map((producto) => producto.categoria)])];
    await cargarCategorias(nombres);
    return nombres.length;
}

async function main() {
    const administrador = leerAdministrador();

    if (await baseTieneDatos()) {
        if (!reiniciar) {
            const agregadas = await completarCategorias();
            if (agregadas > 0) {
                console.log(`La base ya tenía datos: solo se agregaron ${agregadas} categorías, que faltaban.`);
            } else {
                console.log('La base ya tiene datos, no se cargó nada.');
            }
            console.log('Para borrarla por completo y volver a cargarla: npm run seed -- --reset');
            return;
        }
        console.log('Borrando todos los datos (productos, categorías, usuarios, pedidos y sesiones)...');
        await vaciarBase();
    }

    await cargarCategorias(categoriasIniciales);

    // Se cargan de a uno para que los IDs respeten el orden del catálogo.
    for (const datos of productosIniciales) {
        await productoRepository.create(new Producto(
            null, datos.nombre, datos.descripcion, datos.precio,
            datos.stock, datos.categoria, datos.destacado, datos.porEncargo
        ));
    }
    await usuarioRepository.create(administrador);

    console.log(
        `Listo: ${categoriasIniciales.length} categorías, ${productosIniciales.length} productos ` +
        `y la cuenta de administrador (${administrador.email}).`
    );
}

try {
    await main();
} catch (error) {
    console.error(`\nNo se pudo completar la carga inicial.\n${error.message}\n`);
    process.exitCode = 1;
} finally {
    await db.terminate();
}
