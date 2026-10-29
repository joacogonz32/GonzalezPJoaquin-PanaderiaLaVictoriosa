import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)
export const CartContext = createContext(null)
export const ToastContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function useCart() {
  return useContext(CartContext)
}

export function useToast() {
  return useContext(ToastContext)
}
