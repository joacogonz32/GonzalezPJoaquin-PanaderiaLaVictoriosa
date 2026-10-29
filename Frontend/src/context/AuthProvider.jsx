import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext, useToast } from './contexts'
import * as authService from '../services/authService'
import { EVENTO_SESION_EXPIRADA } from '../services/api'
import { leerStorage, guardarStorage, borrarStorage, CLAVES_STORAGE } from '../utils/storage'
import { ROLES } from '../utils/constantes'

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerStorage(CLAVES_STORAGE.SESION))
  const [verificando, setVerificando] = useState(() => Boolean(leerStorage(CLAVES_STORAGE.SESION)))
  const { mostrarInfo } = useToast()

  const guardarSesion = useCallback((nuevaSesion) => {
    if (nuevaSesion) guardarStorage(CLAVES_STORAGE.SESION, nuevaSesion)
    else borrarStorage(CLAVES_STORAGE.SESION)
    setSesion(nuevaSesion)
  }, [])

  // Al iniciar la app, se verifica con el backend que la sesión guardada siga siendo válida.
  useEffect(() => {
    const sesionGuardada = leerStorage(CLAVES_STORAGE.SESION)
    if (!sesionGuardada?.token) return

    authService.getPerfil()
      .then((usuario) => guardarSesion({ token: sesionGuardada.token, usuario }))
      .catch(() => {
        // Si el token es inválido, el evento de sesión expirada limpia la sesión.
      })
      .finally(() => setVerificando(false))
  }, [guardarSesion])

  // Cualquier respuesta 401 del backend cierra la sesión local.
  useEffect(() => {
    const alExpirar = () => {
      guardarSesion(null)
      mostrarInfo('Tu sesión expiró. Volvé a iniciar sesión para continuar.', 'Sesión finalizada')
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [guardarSesion, mostrarInfo])

  const login = useCallback(async (credenciales) => {
    const nuevaSesion = await authService.login(credenciales)
    guardarSesion(nuevaSesion)
    return nuevaSesion.usuario
  }, [guardarSesion])

  const registrar = useCallback(async (datos) => {
    const nuevaSesion = await authService.registrar(datos)
    guardarSesion(nuevaSesion)
    return nuevaSesion.usuario
  }, [guardarSesion])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Aunque el backend no responda, la sesión local se cierra igual.
    }
    guardarSesion(null)
  }, [guardarSesion])

  const usuario = sesion?.usuario ?? null

  const value = useMemo(() => ({
    usuario,
    verificando,
    esAdmin: usuario?.rol === ROLES.ADMINISTRADOR,
    esCliente: usuario?.rol === ROLES.CLIENTE,
    login,
    registrar,
    logout,
  }), [usuario, verificando, login, registrar, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
