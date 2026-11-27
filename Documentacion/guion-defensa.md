# Guion para el video de defensa (5 a 10 minutos)

**Flujo elegido:** un cliente solicita un **Encargo Especial** (torta de cumpleaños) y el administrador lo hace avanzar por sus estados.

Muestra en un solo recorrido: autenticación, roles, patrón Strategy, validación de las 48 hs en frontend y backend, cálculo de la seña, flujo de estados, manejo centralizado de errores y notificaciones.

## Antes de grabar

1. (Opcional) Para partir de los datos iniciales: `cd Backend && npm run seed -- --reset`. **Borra también las cuentas de clientes**: después hay que volver a crear la tuya desde "Crear cuenta" (o registrarla durante el video en el paso 4).
2. Levantar el backend (`cd Backend && npm start`).
3. Levantar el frontend (`cd Frontend && npm run dev`) y abrir `http://localhost:5173`.
4. Tener abiertos en el editor los archivos que se listan abajo, y la [consola de Firebase](https://console.firebase.google.com) en **Firestore Database**.
5. Cerrar sesión en el navegador si había una abierta.
6. Grabar en MP4 (por ejemplo con la Barra de juegos de Windows, `Win + Alt + R`, o con OBS).

## 1. Presentación (≈ 30 s)

- Negocio: Panadería La Victoriosa, Villa Urquiza.
- Stack: React + Vite en el frontend; Node + Express con arquitectura MVC en el backend y base de datos Firebase Cloud Firestore.
- Flujo que se va a mostrar: encargo de una torta de principio a fin.

## 2. Backend: cómo se implementa el flujo (≈ 3 min)

Seguir el camino de la request `POST /api/pedidos`:

| Paso | Archivo | Qué explicar |
|------|---------|--------------|
| Ruta | `Backend/src/routes/pedidoRoutes.js` | `autenticar` y `autorizar(Roles.CLIENTE)`: solo un cliente logueado puede crear pedidos |
| Middleware | `Backend/src/middlewares/auth.js` | Lee el token `Bearer` y deja el usuario en `req.usuario` |
| Controller | `Backend/src/controllers/PedidoController.js` | Solo recibe la request, llama al service y responde con `successResponse` |
| Service | `Backend/src/services/PedidoService.js` → `crear()` | Elige la estrategia por `tipo` y, dentro de una **transacción**, lee los productos, valida, calcula el total y guarda el pedido (en un pedido regular también descuenta el stock) |
| Strategy | `Backend/src/strategies/PedidoEncargoStrategy.js` | Regla de 48 hs, seña del 50% y flujo con "Seña confirmada". `puedePagarSenia`, `puedeAvanzarManualmente` y `puedeCancelarse(estado, rol)` definen que solo el pago confirma la seña y que con la seña paga el cliente ya no cancela. Comparar con `PedidoRegularStrategy.js` (stock) |
| Repository | `Backend/src/repositories/PedidoRepository.js` | Guarda el pedido en la colección `pedidos` de Firestore. El *converter* traduce entre la clase `Pedido` y el documento, y `ContadorRepository` le asigna el número de pedido |
| Errores | `Backend/src/exceptions/AppError.js`, `enums/Messages.js`, `middlewares/errorHandler.js` | El service lanza `BadRequestError(Messages.ORDER_PICKUP_TOO_SOON(48))` y el middleware arma `{ success: false, message }` |

Mencionar también `PATCH /api/pedidos/:id/avanzar`: el service le pide a la estrategia el `siguienteEstado`, así el administrador no puede saltear pasos.

## 3. Frontend: cómo se implementa el flujo (≈ 2 min)

| Archivo | Qué explicar |
|---------|--------------|
| `Frontend/src/services/api.js` | Cliente HTTP único: agrega el token, interpreta `{ success, data, message }` y lanza `ApiError` |
| `Frontend/src/services/pedidosService.js` | `crearPedido`, `getMisPedidos`, `pagarSenia`, `avanzarEstadoPedido`, `cancelarPedido` |
| `Frontend/src/components/PagoSeniaDialog.jsx` | Modal que simula el pago de la seña: muestra seña, saldo y total, y envía el medio elegido |
| `Frontend/src/context/CartProvider.jsx` | El pedido en preparación vive en el navegador hasta que se confirma |
| `Frontend/src/pages/CarritoPage.jsx` | Si hay productos por encargo se fuerza el tipo Encargo; valida la fecha antes de enviar; muestra la notificación de éxito o el error del backend |
| `Frontend/src/components/OrderCard.jsx` | Componente reutilizado por "Mis pedidos" y por la administración; muestra el progreso con el `flujo` que manda el backend |
| `Frontend/src/pages/admin/AdminPedidosPage.jsx` | Botón "Pasar a «…»" que llama a `avanzarEstadoPedido` y recarga la lista |

## 4. Demostración en la interfaz (≈ 3 min)

1. **Inicio**: mostrar que respeta el boceto (navbar con logo centrado, hero, productos estrella cargados desde la API).
2. **Catálogo** → filtrar por "Repostería" → agregar **Torta de cumpleaños** (aparece la notificación lateral).
3. **Tu pedido**: el tipo queda en "Encargo especial" automáticamente. Mostrar la seña del 50%.
4. Hacer click en **Ingresar para confirmar** → iniciar sesión con tu cuenta de cliente (o entrar en **Registrate** y crearla en ese momento) → vuelve al pedido con lo elegido.
5. Elegir una fecha de retiro para **mañana** → confirmar → aparece el error de las 48 hs.
6. Elegir una fecha dentro de **3 días** → confirmar → notificación "¡Encargo registrado!" y redirección a **Mis pedidos**, que abre el modal **Pagar la seña** con la seña, el saldo a pagar en el local y el total.
7. Elegir un medio de pago (por ejemplo **Mercado Pago**) → **Pagar** → notificación "Encargo confirmado": el encargo pasa solo a "Seña confirmada", muestra "Pagada con Mercado Pago" y el saldo a pagar al retirar. Mostrar que ya no aparece el botón de cancelar (con la seña paga, el cliente no puede cancelar).
8. **Salir** → ingresar con la cuenta de administrador (la definida en `Backend/.env`) → **Gestionar pedidos**. Hacer click en **Pasar a «En preparación»** y **Pasar a «Listo para retirar»**; el último botón dice **Entregar y cobrar $…** (el saldo que se paga en el local).
9. (Opcional) Mostrar con un encargo sin pagar que el administrador ve "Esperando que el cliente pague la seña" y no puede avanzarlo.
10. **Consola de Firebase** → Firestore → colección `pedidos`: abrir el documento del encargo y mostrar que el estado, la seña y la fecha de retiro quedaron guardados en la base.

Opcional, si sobra tiempo: en **Gestionar productos**, intentar eliminar un producto y mostrar el diálogo de confirmación.

## 5. Cierre (≈ 30 s)

- La información siempre viene del backend; las reglas de negocio se validan en el backend aunque el frontend también valide.
- Arquitectura: rutas → middlewares → controllers → services → strategies → repositories → Firestore, con errores y mensajes centralizados. Solo los repositories conocen la base de datos.

## Texto para narrar

Leído a ritmo tranquilo dura unos 7 a 8 minutos, con las pausas de la demostración. Entre corchetes, qué mostrar en pantalla.

**Presentación** [inicio de la web]

> Hola. Este es el sistema web de la Panadería La Victoriosa, de Villa Urquiza. El frontend está hecho con React y Vite, y el backend con Node y Express, con arquitectura MVC y la base de datos en Firebase Cloud Firestore. Voy a mostrar un flujo completo: un cliente encarga una torta de cumpleaños, paga la seña y el administrador lo lleva hasta la entrega. Primero el backend, después el frontend y al final el recorrido en la aplicación.

**Backend** [`pedidoRoutes.js`]

> Todo empieza en la ruta POST barra api barra pedidos. Antes de llegar al controller pasa por dos middlewares: `autenticar`, que lee el token Bearer y carga el usuario, y `autorizar`, que deja pasar solo a los clientes. Si falta el token responde 401 y si el rol no corresponde, 403.

[`PedidoController.js`]

> El controller no tiene lógica de negocio: toma el usuario y el body, llama al service y responde con el formato común `success` y `data`. Si algo falla, lo pasa con `next` al middleware de errores.

[`PedidoService.js`, método `crear`]

> La lógica está en el service. Según el tipo de pedido, la fábrica devuelve una estrategia: es el patrón Strategy. Primero valida el formato: que haya productos, que las cantidades sean enteras y positivas y que no se repitan. Después, dentro de una transacción de Firestore, lee los productos, le pide a la estrategia que valide sus reglas, calcula el total y la seña, guarda el pedido y vacía el carrito del cliente. Si es un pedido regular, en la misma transacción descuenta el stock. Así, si dos clientes compran el último producto a la vez, solo uno lo consigue.

[`PedidoEncargoStrategy.js`, y al lado `PedidoRegularStrategy.js`]

> Cada estrategia define su flujo de estados y sus reglas. El encargo exige la fecha de retiro con al menos 48 horas de anticipación, calcula una seña del 50% y no descuenta stock porque se elabora para esa fecha. Además, el administrador no puede confirmarlo a mano: solo lo confirma el pago de la seña. Y con la seña paga, el cliente ya no puede cancelarlo. El pedido regular, en cambio, valida stock y no acepta productos por encargo.

[`pagarSenia` y `avanzarEstado` en el service]

> Pagar la seña valida el medio de pago, verifica que el pedido sea del cliente y que la seña esté pendiente, guarda el pago y pasa el encargo a "Seña confirmada". Avanzar estado, que solo usa el administrador, le pide a la estrategia el siguiente estado, así no se puede saltear ningún paso.

[`PedidoRepository.js`]

> El repository es la única capa que conoce Firestore. Convierte la clase Pedido en un documento y al revés, y el número de pedido sale de un contador que se incrementa dentro de la transacción.

[`Messages.js`, `AppError.js`, `errorHandler.js`]

> Los errores son clases que heredan de AppError, con su código HTTP, y los mensajes están centralizados en un enum. El middleware `errorHandler` los convierte siempre en la misma respuesta: `success false` y un mensaje claro.

**Frontend** [`services/api.js` y `pedidosService.js`]

> En el frontend, todas las peticiones pasan por un único cliente HTTP. Agrega el token, interpreta la respuesta del backend y, si hay error, lanza un ApiError con el mensaje que mandó el servidor. Si la sesión venció, avisa para cerrarla. `pedidosService` expone una función por endpoint.

[`CartProvider.jsx`]

> El carrito es un contexto global. Como invitado se guarda en el navegador; cuando el cliente inicia sesión, se suma al carrito guardado en su cuenta, en Firestore, y desde ahí cada cambio se guarda en la base.

[`CarritoPage.jsx`]

> En la pantalla del pedido, si hay un producto que solo se vende por encargo, el tipo se fuerza a Encargo especial. Antes de enviar valida la fecha para avisar rápido, pero la validación definitiva la hace el backend. Al confirmar, muestra una notificación y lleva a "Mis pedidos" con el pago de la seña abierto.

[`PagoSeniaDialog.jsx`, `OrderCard.jsx`, `AdminPedidosPage.jsx`]

> El modal de la seña muestra la seña, el saldo y el total, y envía el medio elegido. OrderCard se reutiliza en la pantalla del cliente y en la del administrador; dibuja el progreso con el flujo que manda el backend. El backend también indica si el pedido se puede cancelar, avanzar o pagar, así el frontend no repite las reglas.

**Demostración** [navegador]

> Entro al catálogo, filtro Repostería y agrego la torta de cumpleaños. En "Tu pedido" el tipo ya quedó en Encargo especial y muestra la seña del 50%. Como no inicié sesión, el botón me pide ingresar… inicio sesión y vuelvo al pedido con la torta.
>
> Pongo como fecha de retiro mañana y confirmo: aparece el error de las 48 horas. Elijo una fecha dentro de tres días y confirmo: el encargo se registra y se abre el pago de la seña. Elijo Mercado Pago y pago. El encargo pasa solo a "Seña confirmada", muestra el medio de pago, el saldo a pagar en el local, y ya no tengo la opción de cancelar.
>
> Ahora salgo e ingreso como administrador. En Gestionar pedidos veo el encargo con los datos del cliente. Lo paso a "En preparación", después a "Listo para retirar", y el último botón es "Entregar y cobrar" el saldo. Lo finalizo.
>
> Por último, en la consola de Firebase abro la colección pedidos: el documento tiene el estado Finalizado, la seña, el pago y la fecha de retiro. Todo quedó guardado en la base.

**Cierre**

> Resumiendo: la información siempre viene del backend, y las reglas de negocio se validan ahí aunque el frontend también valide para dar una respuesta rápida. La request recorre rutas, middlewares, controller, service, estrategia y repository, con los errores y mensajes centralizados. Gracias.

## Checklist de entrega

- [ ] Duración entre 5 y 10 minutos.
- [ ] Formato MP4.
- [ ] Se ve el backend, el frontend y el flujo completo funcionando.
- [ ] Subido a la tarea de Microsoft Teams.
