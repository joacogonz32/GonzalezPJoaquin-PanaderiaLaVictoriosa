import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función asíncrona (normalmente un servicio) y expone los estados
// de carga, error y datos. La función debe ser estable (definida fuera del componente
// o memorizada con useCallback): cuando cambia, se vuelve a ejecutar.
// `recargar` repite la solicitud manteniendo visibles los datos anteriores.
export function useAsync(funcionAsync) {
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState({ data: null, error: null, funcion: null, version: -1 })

  useEffect(() => {
    let activo = true
    const guardar = (cambios) => {
      if (activo) setResultado((anterior) => ({ ...anterior, ...cambios, funcion: funcionAsync, version }))
    }

    funcionAsync()
      .then((data) => guardar({ data, error: null }))
      .catch((error) => guardar({ data: null, error }))

    return () => {
      activo = false
    }
  }, [funcionAsync, version])

  // Está cargando mientras el último resultado no corresponda a la solicitud actual.
  const cargando = resultado.funcion !== funcionAsync || resultado.version !== version

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback((actualizar) => {
    setResultado((anterior) => ({
      ...anterior,
      data: typeof actualizar === 'function' ? actualizar(anterior.data) : actualizar,
    }))
  }, [])

  return {
    data: resultado.data,
    error: cargando ? null : resultado.error,
    cargando,
    recargar,
    setData,
  }
}
