import { useCallback, useEffect, useState } from 'react'

import { obtenerDetalleProyecto } from '../services/proyecto.service'

import type { DetalleProyecto } from '../types'

export function useDetalleProyecto(proyectoId: string | undefined) {
  const [detalle, setDetalle] = useState<DetalleProyecto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarDetalle = useCallback(async () => {
    if (!proyectoId) {
      setDetalle(null)
      setError('No se recibió un proyecto válido.')
      setCargando(false)
      return
    }

    try {
      setCargando(true)
      setError(null)
      setDetalle(await obtenerDetalleProyecto(proyectoId))
    } catch (error) {
      console.error('Error al cargar el detalle del proyecto:', error)
      setError('No fue posible cargar el proyecto.')
    } finally {
      setCargando(false)
    }
  }, [proyectoId])

  useEffect(() => {
    void cargarDetalle()
  }, [cargarDetalle])

  return {
    detalle,
    cargando,
    error,
    cargarDetalle,
  }
}
