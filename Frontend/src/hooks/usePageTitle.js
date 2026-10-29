import { useEffect } from 'react'

// Actualiza el título de la pestaña para que cada pantalla sea identificable
// (también lo anuncian los lectores de pantalla al navegar).
export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo
      ? `${titulo} · Panadería La Victoriosa`
      : 'Panadería La Victoriosa — Villa Urquiza'
  }, [titulo])
}
