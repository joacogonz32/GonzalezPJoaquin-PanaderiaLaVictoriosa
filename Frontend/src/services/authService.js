import { request } from './api'

export function login(credenciales) {
  return request('/auth/login', { method: 'POST', body: credenciales })
}

export function registrar(datos) {
  return request('/auth/registro', { method: 'POST', body: datos })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function getPerfil() {
  return request('/auth/perfil')
}
