# Guion para el video de defensa (5 a 10 minutos)

**Flujo elegido:** un cliente solicita un **Encargo Especial** (torta de cumpleaños) y el administrador lo hace avanzar por sus estados.

Muestra en un solo recorrido: autenticación, roles, patrón Strategy, validación de las 48 hs en frontend y backend, cálculo de la seña, flujo de estados, manejo centralizado de errores y notificaciones.

## Antes de grabar

1. Reiniciar el backend (`cd Backend && npm start`) para partir de los datos iniciales.
2. Levantar el frontend (`cd Frontend && npm run dev`) y abrir `http://localhost:5173`.
3. Tener abiertos en el editor los archivos que se listan abajo.
4. Cerrar sesión en el navegador si había una abierta.
5. Grabar en MP4 (por ejemplo con la Barra de juegos de Windows, `Win + Alt + R`, o con OBS).

## 1. Presentación (≈ 30 s)

- Negocio: Panadería La Victoriosa, Villa Urquiza.
- Stack: React + Vite en el frontend; Node + Express con arquitectura MVC y datos en memoria en el backend.
- Flujo que se va a mostrar: encargo de una torta de principio a fin.

## 2. Backend: cómo se implementa el flujo (≈ 3 min)

Seguir el camino de la request `POST /api/pedidos`:

| Paso | Archivo | Qué explicar |
|------|---------|--------------|
| Ruta | `Backend/src/routes/pedidoRoutes.js` | `autenticar` y `autorizar(Roles.CLIENTE)`: solo un cliente logueado puede crear pedidos |
| Middleware | `Backend/src/middlewares/auth.js` | Lee el token `Bearer` y deja el usuario en `req.usuario` |
| Controller | `Backend/src/controllers/PedidoController.js` | Solo recibe la request, llama al service y responde con `successResponse` |
| Service | `Backend/src/services/PedidoService.js` → `crear()` | Elige la estrategia por `tipo`, valida los productos, calcula el total y guarda el pedido |
| Strategy | `Backend/src/strategies/PedidoEncargoStrategy.js` | Regla de 48 hs, seña del 50% y flujo con "Seña confirmada". Comparar con `PedidoRegularStrategy.js` (stock) |
| Repository | `Backend/src/repositories/PedidoRepository.js` | Guarda el pedido en el array en memoria |
| Errores | `Backend/src/exceptions/AppError.js`, `enums/Messages.js`, `middlewares/errorHandler.js` | El service lanza `BadRequestError(Messages.ORDER_PICKUP_TOO_SOON(48))` y el middleware arma `{ success: false, message }` |

Mencionar también `PATCH /api/pedidos/:id/avanzar`: el service le pide a la estrategia el `siguienteEstado`, así el administrador no puede saltear pasos.

## 3. Frontend: cómo se implementa el flujo (≈ 2 min)

| Archivo | Qué explicar |
|---------|--------------|
| `Frontend/src/services/api.js` | Cliente HTTP único: agrega el token, interpreta `{ success, data, message }` y lanza `ApiError` |
| `Frontend/src/services/pedidosService.js` | `crearPedido`, `getMisPedidos`, `avanzarEstadoPedido`, `cancelarPedido` |
| `Frontend/src/context/CartProvider.jsx` | El pedido en preparación vive en el navegador hasta que se confirma |
| `Frontend/src/pages/CarritoPage.jsx` | Si hay productos por encargo se fuerza el tipo Encargo; valida la fecha antes de enviar; muestra la notificación de éxito o el error del backend |
| `Frontend/src/components/OrderCard.jsx` | Componente reutilizado por "Mis pedidos" y por la administración; muestra el progreso con el `flujo` que manda el backend |
| `Frontend/src/pages/admin/AdminPedidosPage.jsx` | Botón "Pasar a «…»" que llama a `avanzarEstadoPedido` y recarga la lista |

## 4. Demostración en la interfaz (≈ 3 min)

1. **Inicio**: mostrar que respeta el boceto (navbar con logo centrado, hero, productos estrella cargados desde la API).
2. **Catálogo** → filtrar por "Repostería" → agregar **Torta de cumpleaños** (aparece la notificación lateral).
3. **Tu pedido**: el tipo queda en "Encargo especial" automáticamente. Mostrar la seña del 50%.
4. Hacer click en **Ingresar para confirmar** → iniciar sesión con `cliente@demo.com` / `cliente123` → vuelve al pedido con lo elegido.
5. Elegir una fecha de retiro para **mañana** → confirmar → aparece el error de las 48 hs.
6. Elegir una fecha dentro de **3 días** → confirmar → notificación "¡Pedido confirmado!" y redirección a **Mis pedidos** con el encargo en "Pendiente".
7. **Salir** → ingresar con `admin@lavictoriosa.com` / `admin1234` → **Gestionar pedidos**.
8. Hacer click en **Pasar a «Seña confirmada»** y luego en **Pasar a «En preparación»**. Mostrar que desaparece el botón "Rechazar encargo".
9. **Salir** → volver a ingresar como cliente → **Mis pedidos**: el encargo está "En preparación" y ya no tiene botón de cancelar (regla de negocio).

Opcional, si sobra tiempo: en **Gestionar productos**, intentar eliminar un producto y mostrar el diálogo de confirmación.

## 5. Cierre (≈ 30 s)

- La información siempre viene del backend; las reglas de negocio se validan en el backend aunque el frontend también valide.
- Arquitectura: rutas → middlewares → controllers → services → strategies → repositories, con errores y mensajes centralizados.

## Checklist de entrega

- [ ] Duración entre 5 y 10 minutos.
- [ ] Formato MP4.
- [ ] Se ve el backend, el frontend y el flujo completo funcionando.
- [ ] Subido a la tarea de Microsoft Teams.
