# Frontend — Panadería La Victoriosa

React 19 + Vite + React Router. Consume la API del backend (`../Backend`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
npm run lint     # oxlint
```

La URL de la API se configura con `VITE_API_URL` (ver `.env.example`). Por defecto es `http://localhost:3000/api`.

Todas las peticiones HTTP pasan por `src/services/api.js`, que agrega el token de sesión, interpreta el formato `{ success, data | message }` del backend y lanza un `ApiError` con el mensaje recibido. Las páginas solo llaman a las funciones de `productosService`, `authService` y `pedidosService`.

Ver el [README principal](../README.md) para la descripción completa de pantallas y endpoints.
