# Panadería La Victoriosa

Repositorio del trabajo práctico. Panadería La Victoriosa (Villa Urquiza, CABA).

Sistema web para la panadería: catálogo de productos, **Pedidos Regulares** (productos del día para retirar en el local) y **Encargos Especiales** (tortas, sándwiches de miga y otros productos por cantidad, con 48 hs de anticipación). Tiene dos tipos de usuario: **Cliente** y **Administrador**.

## Cómo ejecutar el sistema

Se necesitan Node.js 20 o superior y dos terminales.

```bash
# Terminal 1: backend (http://localhost:3000)
cd Backend
npm install
npm start

# Terminal 2: frontend (http://localhost:5173)
cd Frontend
npm install
npm run dev
```

El frontend usa `http://localhost:3000/api` por defecto. Para cambiarlo, copiar `Frontend/.env.example` como `Frontend/.env` y editar `VITE_API_URL`.

> Los datos se guardan en memoria (arrays): al reiniciar el backend se vuelve al catálogo y los usuarios iniciales, y se pierden los pedidos y las cuentas creadas.

### Cuentas de prueba

Se cargan al iniciar el backend ([Backend/src/data/usuarios.js](Backend/src/data/usuarios.js)):

| Rol           | Email                    | Contraseña  |
|---------------|--------------------------|-------------|
| Administrador | `admin@lavictoriosa.com` | `admin1234` |
| Cliente       | `cliente@demo.com`       | `cliente123`|

También se puede crear una cuenta de cliente nueva desde "Crear cuenta".

## Estructura del repositorio

```
TpCallipo-PanaderiaLaVictoriosa/
├── Documentacion/          # Relevamiento, análisis del sistema, identidad visual, wireframe y mockup
├── Backend/
│   ├── server.js           # Punto de entrada (levanta el servidor Express)
│   ├── postman/            # Colección y environment de Postman
│   └── src/
│       ├── app.js          # Configuración de Express (CORS, JSON, rutas y middlewares)
│       ├── models/         # Clases del dominio (solo atributos)
│       ├── controllers/    # Reciben request/response y delegan en los services
│       ├── services/       # Lógica de negocio y validaciones
│       ├── strategies/     # Patrón Strategy: reglas y flujo de estados de cada tipo de pedido
│       ├── repositories/   # Acceso a los datos (arrays en memoria)
│       ├── data/           # Datos iniciales (catálogo y usuarios de prueba)
│       ├── routes/         # Definición de endpoints por recurso
│       ├── middlewares/    # Errores, rutas inexistentes, autenticación/roles y validación de ID
│       ├── responses/      # Formato consistente de respuestas HTTP
│       ├── exceptions/     # AppError y sus subclases
│       ├── enums/          # Mensajes, roles, categorías, tipos/estados de pedido y reglas
│       └── utils/          # Validadores, hash de contraseñas y generador de IDs
├── Frontend/
│   └── src/
│       ├── App.jsx         # Rutas de la aplicación
│       ├── main.jsx        # Punto de entrada (router y providers)
│       ├── assets/         # Recursos gráficos
│       ├── components/     # Componentes reutilizables (cards, formularios, modal, toasts…)
│       ├── pages/          # Pantallas (inicio, catálogo, pedido, cuenta y administración)
│       ├── services/       # Comunicación con la API (todas las peticiones HTTP)
│       ├── context/        # Estado global: sesión, pedido en curso y notificaciones
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
- **Categoria**: las categorías válidas (Facturas, Panes, Sándwiches, Repostería) están centralizadas en `enums/Categorias.js`.

### Patrón Strategy para los tipos de pedido

`PedidoService` delega en la estrategia del tipo de pedido ([Backend/src/strategies/](Backend/src/strategies/)):

| | `PedidoRegularStrategy` | `PedidoEncargoStrategy` |
|---|---|---|
| Flujo | Pendiente → Confirmado → En preparación → Listo para retirar → Finalizado | Pendiente → Seña confirmada → En preparación → Listo para retirar → Finalizado |
| Cancelable desde | Pendiente, Confirmado | Pendiente, Seña confirmada |
| Validación | No admite productos por encargo; cantidad ≤ stock | Fecha de retiro obligatoria, al menos 48 hs después |
| Stock | Se descuenta al crear y se repone al cancelar | No se descuenta (se elabora para la fecha) |
| Seña | — | 50% del total |

## API

Todas las respuestas tienen el mismo formato:

```json
{ "success": true, "data": { } }
{ "success": false, "message": "El producto no existe." }
```

Los errores se lanzan como `AppError` (`BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409) con mensajes de `enums/Messages.js`, y el middleware `errorHandler` los convierte en la respuesta HTTP. Un JSON mal formado responde 400 y cualquier error no previsto, 500.

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
| GET    | `/categorias`  | Público       | Categorías válidas |
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
| PATCH  | `/:id/cancelar`   | Dueño o administrador    | Cancela (o rechaza) el pedido si su estado lo permite |

```json
{
  "tipo": "ENCARGO",
  "fechaRetiro": "2026-11-02T13:00:00.000Z",
  "detalles": [{ "productoId": 9, "cantidad": 1 }]
}
```

Cada pedido devuelto incluye además `cliente`, `flujo` (estados de su tipo), `siguienteEstado` y `cancelable`, para que el frontend no repita las reglas de la Strategy.

### Reglas de negocio validadas en el backend

- Campos obligatorios, formato de email, teléfono con al menos 8 dígitos y contraseña de al menos 6 caracteres.
- No se repiten emails de clientes ni nombres de productos (409).
- Precio mayor a cero, stock entero mayor o igual a cero y categoría válida.
- Solo el administrador modifica productos, precios, stock y estados de pedidos.
- Un Pedido Regular no puede superar el stock disponible ni incluir productos por encargo.
- Un Encargo Especial requiere fecha de retiro con al menos 48 hs de anticipación.
- Un pedido no se puede cancelar desde "En preparación" en adelante, ni avanzar desde un estado final.
- Cada cliente solo ve y cancela sus propios pedidos.

### Probar con Postman

En [Backend/postman/](Backend/postman/) está la colección lista para importar:

- `PanaderiaLaVictoriosa.postman_collection.json`
- `PanaderiaLaVictoriosa.postman_environment.json` (variable `baseUrl = http://localhost:3000`)

1. Abrir Postman → **Import** → seleccionar ambos archivos.
2. Elegir el environment "Panadería La Victoriosa - Local".
3. Con el servidor corriendo, ejecutar la colección en orden. La carpeta **0. Autenticación** inicia sesión y guarda los tokens que usan las demás requests.

También se puede correr con [Newman](https://www.npmjs.com/package/newman):

```bash
cd Backend/postman
npx newman run PanaderiaLaVictoriosa.postman_collection.json -e PanaderiaLaVictoriosa.postman_environment.json
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
