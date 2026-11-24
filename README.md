# Panadería La Victoriosa

Repositorio del trabajo práctico. Panadería La Victoriosa (Villa Urquiza, CABA).

Sistema web para la panadería: catálogo de productos, **Pedidos Regulares** (productos del día para retirar en el local) y **Encargos Especiales** (tortas, sándwiches de miga y otros productos por cantidad, con 48 hs de anticipación). Tiene dos tipos de usuario: **Cliente** y **Administrador**.

## Cómo ejecutar el sistema

Se necesitan Node.js 22 o superior, dos terminales y un proyecto de Firebase con Cloud Firestore (ver [Base de datos](#base-de-datos-firebase-cloud-firestore)).

```bash
# Terminal 1: backend (http://localhost:3000)
cd Backend
npm install
# (solo la primera vez) configurar Backend/.env y cargar los datos iniciales:
npm run seed
npm start

# Terminal 2: frontend (http://localhost:5173)
cd Frontend
npm install
npm run dev
```

El frontend usa `http://localhost:3000/api` por defecto. Para cambiarlo, copiar `Frontend/.env.example` como `Frontend/.env` y editar `VITE_API_URL`.

Los datos se guardan en Firestore: los productos, categorías, usuarios, pedidos, carritos y sesiones se mantienen aunque se reinicie el backend.

### Cuentas

- **Administrador**: no puede registrarse desde la web. `npm run seed` lo crea con el email y la contraseña definidos en `Backend/.env` (`SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`), que no se suben al repositorio.
- **Clientes**: se registran desde "Crear cuenta".

## Base de datos (Firebase Cloud Firestore)

Solo el backend se conecta a Firestore, con el SDK `firebase-admin`. El frontend habla únicamente con la API. Dentro del backend, la base solo se usa desde la capa **Repositories**; routes, controllers, services y strategies no conocen Firestore.

### Configuración (una sola vez)

1. Entrar a [console.firebase.google.com](https://console.firebase.google.com) → **Crear un proyecto** (Google Analytics se puede desactivar).
2. En el menú **Compilación → Firestore Database** → **Crear base de datos**. Elegir una ubicación cercana (por ejemplo `southamerica-east1`, São Paulo) y el **modo de producción**. Ese modo bloquea el acceso directo desde navegadores; el backend no se ve afectado porque `firebase-admin` accede con la cuenta de servicio.
3. En **Configuración del proyecto** (ícono de engranaje) → **Cuentas de servicio** → **Generar nueva clave privada**. Guardar el archivo descargado como `Backend/firebase-credentials.json`.
4. Copiar `Backend/.env.example` como `Backend/.env` y completar `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` con los datos que se quieran para el administrador.
5. Desde `Backend/`, ejecutar `npm run seed` para cargar las categorías, el catálogo y la cuenta de administrador.

> `Backend/.env` y `Backend/firebase-credentials.json` están en el `.gitignore`: **nunca deben subirse al repositorio**, porque la clave da acceso total a la base.

Al iniciar, el backend comprueba la conexión. Si falta la configuración o la base no responde, muestra un mensaje que lo indica y no arranca. Si la base está vacía, avisa que hay que ejecutar el seed.

### Carga inicial

| Comando | Qué hace |
|---------|----------|
| `npm run seed` | Carga las 4 categorías ([Backend/src/data/categorias.js](Backend/src/data/categorias.js)), los 11 productos del catálogo ([Backend/src/data/productos.js](Backend/src/data/productos.js)) y el administrador. Si la base ya tiene datos, solo agrega las categorías en caso de que falte esa colección (bases creadas antes de que existiera); no modifica nada más. |
| `npm run seed -- --reset` | **Borra toda la base** (productos, categorías, usuarios, pedidos, carritos y sesiones) y la vuelve a cargar. Las cuentas de clientes también se borran. |

### Colecciones

| Colección | Documento | Campos |
|-----------|-----------|--------|
| `productos` | `productos/{id}` | `id`, `nombre`, `nombreNormalizado`, `descripcion`, `precio`, `stock`, `categoria`, `destacado`, `porEncargo` |
| `categorias` | `categorias/{id}` | `id`, `nombre` |
| `usuarios` | `usuarios/{id}` | `id`, `nombre`, `email` (en minúsculas), `contrasena` (hash `salt:hash` con scrypt), `telefono`, `rol` |
| `pedidos` | `pedidos/{id}` | `id`, `clienteId`, `fecha`, `tipo`, `estado`, `total`, `detalles` (lista de `{ productoId, nombreProducto, precioUnitario, cantidad, subtotal }`), `fechaRetiro`, `montoSenia`, `pagoSenia` (`{ medio, fecha }` o `null`) |
| `carritos` | `carritos/{clienteId}` | `clienteId`, `items` (lista de `{ productoId, cantidad }`), `actualizadoEn` |
| `sesiones` | `sesiones/{token}` | `usuarioId`, `creadaEn` |
| `contadores` | `contadores/{coleccion}` | `ultimoId` |

Decisiones de diseño:

- **IDs numéricos** (`1`, `2`, `3`…) en lugar de los IDs automáticos de Firestore, para mantener la API, la validación de rutas y los números de pedido legibles. Cada colección tiene un documento en `contadores` que se incrementa dentro de una transacción, así dos altas simultáneas nunca reciben el mismo ID.
- **Converters**: cada repository convierte entre la clase del modelo (`Producto`, `Categoria`, `Cliente`/`Administrador` según el `rol`, `Pedido` con sus `DetallePedido`, `Carrito` con sus `ItemCarrito`) y el documento de Firestore. Las fechas se guardan como `Timestamp` y la API las sigue devolviendo en formato ISO 8601.
- **Detalles dentro del pedido**: las líneas se guardan en el mismo documento porque siempre se leen junto con el pedido y conservan nombre y precio del momento de la compra.
- **Categoría por nombre en el producto**: cada producto guarda el nombre de su categoría (no su ID), así el catálogo se lee en una sola consulta. Al crear o editar un producto, el service verifica dentro de la transacción que esa categoría exista en la colección `categorias`.
- **Un carrito por cliente**: el ID del documento es el del cliente. Solo guarda productos y cantidades; al leerlo se completa con el precio y el stock vigentes y se omiten los productos eliminados del catálogo. Al confirmar un pedido, el carrito se vacía en la misma transacción que crea el pedido.
- **`nombreNormalizado`**: Firestore distingue mayúsculas al comparar, por eso se guarda el nombre en minúsculas para detectar productos duplicados.
- **Transacciones**: crear un pedido, descontar el stock y vaciar el carrito, cancelarlo y reponer el stock, avanzar un estado, y las altas que verifican duplicados (email, nombre de producto) se hacen en transacciones. Si dos clientes compran el último producto a la vez, solo uno lo consigue y el otro recibe el error de stock insuficiente.
- **Sin índices compuestos**: las consultas usan solo filtros por igualdad y el ordenamiento se hace en el service, así no hace falta crear índices en la consola.

### Alternativa: emulador local

Para trabajar sin conexión ni cuenta de Google se puede usar el [emulador de Firestore](https://firebase.google.com/docs/emulator-suite). Requiere Java 11 o superior.

```bash
npx firebase-tools emulators:start --only firestore --project demo-la-victoriosa
```

Después, en `Backend/.env`, descomentar `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` y `FIREBASE_PROJECT_ID=demo-la-victoriosa`, y ejecutar `npm run seed`. Los datos del emulador se borran al cerrarlo.

## Estructura del repositorio

```
TpCallipo-PanaderiaLaVictoriosa/
├── Documentacion/          # Relevamiento, análisis del sistema, identidad visual, wireframe y mockup
├── Backend/
│   ├── server.js           # Punto de entrada (verifica la conexión con Firestore y levanta Express)
│   ├── .env.example        # Plantilla de configuración (credenciales de Firebase y administrador)
│   ├── scripts/seed.js     # Carga inicial de la base (npm run seed)
│   ├── postman/            # Colección y environment de Postman
│   └── src/
│       ├── app.js          # Configuración de Express (CORS, JSON, rutas y middlewares)
│       ├── config/         # Variables de entorno y conexión con Firebase
│       ├── models/         # Clases del dominio (solo atributos)
│       ├── controllers/    # Reciben request/response y delegan en los services
│       ├── services/       # Lógica de negocio, validaciones y transacciones
│       ├── strategies/     # Patrón Strategy: reglas y flujo de estados de cada tipo de pedido
│       ├── repositories/   # Acceso a Firestore: convierten documentos en modelos y viceversa
│       ├── data/           # Categorías y catálogo iniciales que carga el seed
│       ├── routes/         # Definición de endpoints por recurso
│       ├── middlewares/    # Errores, rutas inexistentes, autenticación/roles y validación de ID
│       ├── responses/      # Formato consistente de respuestas HTTP
│       ├── exceptions/     # AppError y sus subclases
│       ├── enums/          # Mensajes, roles, tipos/estados de pedido, reglas y colecciones
│       └── utils/          # Validadores y hash de contraseñas
├── Frontend/
│   └── src/
│       ├── App.jsx         # Rutas de la aplicación
│       ├── main.jsx        # Punto de entrada (router y providers)
│       ├── assets/         # Recursos gráficos
│       ├── components/     # Componentes reutilizables (cards, formularios, modal, toasts…)
│       ├── pages/          # Pantallas (inicio, catálogo, pedido, cuenta y administración)
│       ├── services/       # Comunicación con la API (todas las peticiones HTTP)
│       ├── context/        # Estado global: sesión, pedido en curso (carrito) y notificaciones
│       ├── hooks/          # Hooks reutilizables (carga asíncrona, título de página)
│       ├── utils/          # Formateo, validaciones y constantes
│       └── styles/         # Variables de la identidad visual y estilos compartidos
├── diagrama-clases_panaderialavictoriosa.excalidraw
└── README.md
```

## Modelo del dominio

Entidades identificadas en el análisis del sistema ([Documentacion/analisis-sistema-la-victoriosa.pdf](Documentacion/analisis-sistema-la-victoriosa.pdf)):

- **Usuario**: clase base con los datos de login (`rol` indica el tipo). De ella heredan `Cliente` y `Administrador`.
- **Producto**: artículo del catálogo con precio, stock del día y categoría. `porEncargo` indica que solo se vende como Encargo Especial y `destacado` que aparece en el inicio.
- **Pedido**: Pedido Regular o Encargo Especial (atributo `tipo`). Guarda el cliente, el estado, el total, la fecha de retiro y la seña.
- **DetallePedido**: línea de un pedido. Guarda nombre y precio del producto al momento de la compra, para que el historial no cambie si el producto se edita o elimina.
- **Categoria**: agrupa los productos del catálogo (Facturas, Panes, Sándwiches, Repostería). Se guardan en la colección `categorias` y solo se aceptan productos de una categoría existente.
- **Carrito** / **ItemCarrito**: pedido en preparación de un cliente, con los productos y cantidades que eligió y todavía no confirmó. Se guarda en la base, así se conserva entre sesiones y dispositivos.

### Patrón Strategy para los tipos de pedido

`PedidoService` delega en la estrategia del tipo de pedido ([Backend/src/strategies/](Backend/src/strategies/)):

| | `PedidoRegularStrategy` | `PedidoEncargoStrategy` |
|---|---|---|
| Flujo | Pendiente → Confirmado → En preparación → Listo para retirar → Finalizado | Pendiente → Seña confirmada → En preparación → Listo para retirar → Finalizado |
| Paso de Pendiente al segundo estado | Lo hace el administrador | Lo hace el **pago de la seña** del cliente; el administrador no puede saltearlo |
| Cancelable por el cliente | Pendiente, Confirmado | Solo Pendiente (con la seña paga ya no puede cancelar) |
| Cancelable por el administrador | Pendiente, Confirmado | Pendiente, Seña confirmada (si la seña estaba paga, queda a reintegrar) |
| Validación | No admite productos por encargo; cantidad ≤ stock | Fecha de retiro obligatoria, al menos 48 hs después |
| Stock | Se descuenta al crear y se repone al cancelar | No se descuenta (se elabora para la fecha) |
| Pago | Todo en el local al retirar | 50% de seña por la web (simulada) y el saldo en el local al retirar |

**Pago de la seña (simulado):** el cliente elige un medio (Transferencia, Mercado Pago o Tarjeta) y confirma; no se piden datos de tarjeta ni se cobra nada real. El pedido guarda el medio y la fecha del pago (`pagoSenia`). Al pasar el pedido a "Finalizado", el administrador registra la entrega y el cobro del saldo en el local.

## API

Todas las respuestas tienen el mismo formato:

```json
{ "success": true, "data": { } }
{ "success": false, "message": "El producto no existe." }
```

Los errores se lanzan como `AppError` (`BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409) con mensajes de `enums/Messages.js`, y el middleware `errorHandler` los convierte en la respuesta HTTP. Un JSON mal formado responde 400; si la base de datos no responde, 503; y cualquier otro error no previsto, 500.

Las rutas protegidas reciben el token devuelto por el login en el header `Authorization: Bearer <token>`.

### Autenticación — `/api/auth`

| Método | Endpoint     | Acceso    | Descripción |
|--------|--------------|-----------|-------------|
| POST   | `/registro`  | Público   | Registra un cliente (`nombre`, `email`, `contrasena`, `telefono`) e inicia sesión |
| POST   | `/login`     | Público   | Inicia sesión (`email`, `contrasena`). Devuelve `{ token, usuario }` |
| POST   | `/logout`    | Con sesión | Cierra la sesión |
| GET    | `/perfil`    | Con sesión | Datos del usuario logueado |

### Productos (CRUD principal) — `/api/productos`

| Método | Endpoint       | Acceso        | Descripción |
|--------|----------------|---------------|-------------|
| GET    | `/`            | Público       | Obtener todos los productos |
| GET    | `/categorias`  | Público       | Nombres de las categorías guardadas en la base |
| GET    | `/:id`         | Público       | Obtener un producto por ID |
| POST   | `/`            | Administrador | Crear un producto |
| PUT    | `/:id`         | Administrador | Modificar un producto (actualización parcial) |
| DELETE | `/:id`         | Administrador | Eliminar un producto |

```json
{
  "nombre": "Medialunas de manteca",
  "descripcion": "Receta tradicional. Precio por docena.",
  "precio": 4800,
  "stock": 40,
  "categoria": "Facturas",
  "porEncargo": false,
  "destacado": true
}
```

### Pedidos — `/api/pedidos`

| Método | Endpoint          | Acceso                   | Descripción |
|--------|-------------------|--------------------------|-------------|
| POST   | `/`               | Cliente                  | Crear un Pedido Regular o un Encargo Especial |
| GET    | `/mios`           | Cliente                  | Historial de pedidos del cliente |
| GET    | `/`               | Administrador            | Todos los pedidos (filtros opcionales `?estado=` y `?tipo=`) |
| GET    | `/:id`            | Dueño o administrador    | Un pedido |
| PATCH  | `/:id/avanzar`    | Administrador            | Pasa el pedido al siguiente estado de su flujo |
| PATCH  | `/:id/pagar-senia` | Cliente (dueño)         | Pago simulado de la seña de un encargo (`{ "medio": "Mercado Pago" }`). Lo pasa a "Seña confirmada" |
| PATCH  | `/:id/cancelar`   | Dueño o administrador    | Cancela (o rechaza) el pedido si su estado lo permite |

```json
{
  "tipo": "ENCARGO",
  "fechaRetiro": "2026-11-02T13:00:00.000Z",
  "detalles": [{ "productoId": 9, "cantidad": 1 }]
}
```

Cada pedido devuelto incluye además `cliente`, `flujo` (estados de su tipo), `siguienteEstado`, `avanzable`, `cancelable`, `puedePagarSenia` (calculados según el rol de quien consulta) y `saldo` (lo que falta abonar en el local), para que el frontend no repita las reglas de la Strategy.

### Carrito — `/api/carrito`

Guarda el pedido en preparación del cliente logueado. Cada cliente accede solo al suyo (se identifica por el token).

| Método | Endpoint | Acceso  | Descripción |
|--------|----------|---------|-------------|
| GET    | `/`      | Cliente | Carrito guardado, con los datos vigentes de cada producto |
| PUT    | `/`      | Cliente | Reemplaza el carrito completo. Una lista vacía lo vacía. Los productos que ya no existen se omiten |
| DELETE | `/`      | Cliente | Vacía el carrito |

```json
{ "items": [{ "productoId": 1, "cantidad": 2 }, { "productoId": 4, "cantidad": 1 }] }
```

Respuesta de `GET` y `PUT`: `{ "items": [{ "producto": { … }, "cantidad": 2 }], "cantidadTotal": 3, "total": 5600 }`.

En el frontend, el invitado arma el carrito en el navegador (localStorage). Al iniciar sesión como cliente, lo que eligió se suma al carrito guardado en su cuenta y, desde ahí, cada cambio se guarda en la base.

### Reglas de negocio validadas en el backend

- Campos obligatorios, formato de email, teléfono con al menos 8 dígitos y contraseña de al menos 6 caracteres.
- No se repiten emails de clientes ni nombres de productos (409).
- Precio mayor a cero, stock entero mayor o igual a cero y una categoría que exista en la base.
- El carrito admite cantidades enteras mayores a cero y no repite productos; el stock se valida al confirmar el pedido.
- Solo el administrador modifica productos, precios, stock y estados de pedidos.
- Un Pedido Regular no puede superar el stock disponible ni incluir productos por encargo.
- Un Encargo Especial requiere fecha de retiro con al menos 48 hs de anticipación.
- Un pedido no se puede cancelar desde "En preparación" en adelante, ni avanzar desde un estado final.
- Un Encargo Especial no avanza hasta que el cliente paga la seña; la seña solo se paga una vez, con un medio válido y por el dueño del encargo. Con la seña paga, solo el administrador puede cancelarlo.
- Cada cliente solo ve y cancela sus propios pedidos.

### Probar con Postman

En [Backend/postman/](Backend/postman/) está la colección lista para importar:

- `PanaderiaLaVictoriosa.postman_collection.json`
- `PanaderiaLaVictoriosa.postman_environment.json` (variables `baseUrl`, `adminEmail` y `adminPassword`)

1. Abrir Postman → **Import** → seleccionar ambos archivos.
2. Elegir el environment "Panadería La Victoriosa - Local" y completar `adminEmail` y `adminPassword` con los valores de `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` del `.env`.
3. Con el servidor corriendo, ejecutar la colección en orden. La carpeta **0. Autenticación** inicia sesión como administrador, registra un cliente de prueba nuevo (con un email único por ejecución) y guarda los tokens que usan las demás requests.

> Como los datos ahora persisten, cada ejecución deja en la base un cliente de prueba (`cliente.<número>@prueba.com`) y un pedido cancelado. Para limpiarlos: `npm run seed -- --reset`.

También se puede correr con [Newman](https://www.npmjs.com/package/newman):

```bash
cd Backend/postman
npx newman run PanaderiaLaVictoriosa.postman_collection.json -e PanaderiaLaVictoriosa.postman_environment.json \
  --env-var adminEmail=<email del admin> --env-var adminPassword=<contraseña del admin>
```

## Frontend

React 19 + Vite + React Router. Respeta el boceto ([Documentacion/mockup-la-victoriosa.html](Documentacion/mockup-la-victoriosa.html)): paleta crema, chocolate y dorado; tipografías Raleway y Open Sans; navbar con logo centrado; hero oscuro; cards de productos y footer de tres columnas.

| Ruta | Pantalla | Acceso |
|------|----------|--------|
| `/` | Inicio: hero, sobre nosotros y productos destacados | Público |
| `/productos` | Catálogo con filtro por categoría | Público |
| `/pedido` | Pedido en curso: cantidades, tipo de pedido, fecha de retiro y confirmación | Público (confirmar requiere sesión de cliente) |
| `/ingresar`, `/registro` | Inicio de sesión y registro | Público |
| `/mis-pedidos` | Historial, estado y cancelación de pedidos | Cliente |
| `/admin/productos` | CRUD de productos y stock | Administrador |
| `/admin/pedidos` | Pedidos de todos los clientes: avanzar estado y rechazar | Administrador |

Cambios justificados respecto del boceto:

- Barra superior oscura con las acciones de la cuenta (ingresar, mis pedidos, salir), para no alterar la navbar original.
- Los textos dorados sobre fondo claro usan un dorado más oscuro (`--gold-dark`) para cumplir el contraste mínimo de accesibilidad. El dorado original se mantiene en botones, divisores y fondos oscuros.
- Las ilustraciones de los productos siguen el recurso del mockup (emoji sobre degradé según la categoría), ya que no hay fotografías reales.
