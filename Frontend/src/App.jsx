import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import CatalogoPage from './pages/CatalogoPage'
import CarritoPage from './pages/CarritoPage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import MisPedidosPage from './pages/MisPedidosPage'
import AdminProductosPage from './pages/admin/AdminProductosPage'
import AdminPedidosPage from './pages/admin/AdminPedidosPage'
import NotFoundPage from './pages/NotFoundPage'
import { ROLES } from './utils/constantes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="productos" element={<CatalogoPage />} />
        <Route path="pedido" element={<CarritoPage />} />
        <Route path="ingresar" element={<LoginPage />} />
        <Route path="registro" element={<RegistroPage />} />
        <Route
          path="mis-pedidos"
          element={<ProtectedRoute roles={[ROLES.CLIENTE]}><MisPedidosPage /></ProtectedRoute>}
        />
        <Route
          path="admin/productos"
          element={<ProtectedRoute roles={[ROLES.ADMINISTRADOR]}><AdminProductosPage /></ProtectedRoute>}
        />
        <Route
          path="admin/pedidos"
          element={<ProtectedRoute roles={[ROLES.ADMINISTRADOR]}><AdminPedidosPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
