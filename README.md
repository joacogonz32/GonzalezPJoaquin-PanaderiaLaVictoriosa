# Panadería La Victoriosa

Repositorio del trabajo práctico. Panadería La Victoriosa (Villa Urquiza, CABA).

## Estructura del repositorio

```
TpCallipo-PanaderiaLaVictoriosa/
├── Documentacion/       # Relevamiento, análisis del sistema, identidad visual, wireframe y mockup
├── Frontend/            # React + Vite (scaffolding inicial, sin funcionalidad propia)
├── Backend/
│   ├── package.json
│   ├── server.js        # Punto de entrada (levanta el servidor Express)
│   └── src/
│       ├── app.js          # Configuración de la app Express (middlewares y rutas)
│       ├── models/         # Clases del dominio (atributos, sin lógica de negocio)
│       ├── controllers/    # Reciben request/response, delegan en los services
│       ├── services/       # Lógica de negocio y validaciones
│       ├── repositories/    # Acceso a los datos (arrays en memoria)
│       ├── routes/         # Definición de endpoints por entidad
│       ├── middlewares/    # Manejo centralizado de errores y rutas no encontradas
│       ├── responses/      # Formato consistente de respuestas HTTP
│       ├── exceptions/     # AppError y sus subclases
│       ├── enums/          # Messages.js (mensajes centralizados)
│       └── utils/          # Utilidades (ej. generador de IDs)
├── diagrama-clases_panaderialavictoriosa.excalidraw
└── README.md
```

## Modelo del dominio

Entidades principales identificadas a partir del análisis del sistema ([Documentacion/analisis-sistema-la-victoriosa.docx](Documentacion/analisis-sistema-la-victoriosa.docx)) y la ficha técnica del negocio ([Documentacion/FichaTecnica-PanaderiaLaVictoriosa.docx](Documentacion/FichaTecnica-PanaderiaLaVictoriosa.docx)):

- **Usuario**: clase base con los datos de login, de la que heredan `Cliente` y `Administrador`.
- **Cliente**: usuario que consulta el catálogo, realiza Pedidos Regulares y solicita Encargos Especiales.
- **Administrador**: usuario que gestiona el catálogo de productos y el estado de los pedidos.
- **Categoria**: clasificación de los productos (facturas, panes, sándwiches, repostería).
- **Producto**: artículo del catálogo, con precio y stock, perteneciente a una categoría.
- **Pedido**: representa tanto un Pedido Regular como un Encargo Especial (diferenciados por el atributo `tipo`); el comportamiento específico de cada uno se resolverá más adelante con el patrón Strategy.
- **DetallePedido**: línea de un pedido, vincula un `Pedido` con un `Producto` y su cantidad/subtotal.

### Diagrama de clases

El diagrama de clases está en (D:\IPM\TpCallipo-PanaderiaLaVictoriosa\diagrama-clases_panaderialavictoriosa.excalidraw).

> Nota: los métodos del diagrama son conceptuales, para guiar etapas futuras del desarrollo. Las clases de `Backend/src/models/` solo definen atributos (constructor), sin lógica de negocio.

## Backend/src/models

Cada archivo define únicamente una clase con sus atributos (constructor), sin lógica de negocio:

- `Usuario.js`
- `Cliente.js` (extiende `Usuario`)
- `Administrador.js` (extiende `Usuario`)
- `Categoria.js`
- `Producto.js`
- `Pedido.js`
- `DetallePedido.js`

## API (arquitectura MVC)

El Backend implementa el patrón MVC con Express y persistencia en memoria (arrays), sin base de datos.

Capas y responsabilidades:

- **routes**: define los endpoints y los conecta con su controller.
- **controllers**: reciben `req`/`res`, delegan en el service y devuelven la respuesta.
- **services**: contienen la lógica de negocio y las validaciones, lanzan errores (`AppError`).
- **repositories**: acceso a los datos, almacenados en arrays en memoria.
- **middlewares**: `errorHandler` (manejo centralizado de errores) y `routeNotFound` (rutas inexistentes).
- **responses**: `successResponse`/`errorResponse`, formato consistente `{ success, data }` / `{ success, message }`.
- **exceptions**: `AppError` y sus subclases `BadRequestError` (400), `NotFoundError` (404), `ConflictError` (409), `InternalServerError` (500).
- **enums**: `Messages.js`, mensajes centralizados de la aplicación.
- **utils**: utilidades generales (ej. generador de IDs incrementales).

### CRUD de Producto

Correr el servidor:

```bash
cd Backend
npm install
npm start
```

Endpoints disponibles (base `http://localhost:3000/api/productos`):

| Método | Endpoint          | Descripción              |
|--------|-------------------|---------------------------|
| GET    | `/`               | Obtener todos los productos |
| GET    | `/:id`            | Obtener un producto por ID |
| POST   | `/`               | Crear un producto |
| PUT    | `/:id`            | Modificar un producto |
| DELETE | `/:id`            | Eliminar un producto |

Body esperado para `POST`/`PUT` (JSON):

```json
{
  "nombre": "Medialuna de manteca",
  "descripcion": "Clásica, hojaldrada",
  "precio": 300,
  "stock": 50,
  "categoria": "Facturas"
}
```

### Probar con Postman

En [Backend/postman/](Backend/postman/) está la colección lista para importar:

- `PanaderiaLaVictoriosa.postman_collection.json`
- `PanaderiaLaVictoriosa.postman_environment.json` (variable `baseUrl = http://localhost:3000`)

Pasos:

1. Abrir Postman → **Import** → seleccionar ambos archivos.
2. Elegir el environment "Panadería La Victoriosa - Local" (arriba a la derecha).
3. Con el servidor corriendo (`npm start`), ejecutar las requests de la carpeta **Producto - CRUD** en orden (cada una tiene tests automáticos y la 2 guarda el `id` creado para las siguientes).
4. La carpeta **Casos de error** prueba 400, 404 y 409.

También se puede correr toda la colección de una vez con [Newman](https://www.npmjs.com/package/newman):

```bash
cd Backend/postman
npx newman run PanaderiaLaVictoriosa.postman_collection.json -e PanaderiaLaVictoriosa.postman_environment.json
```

