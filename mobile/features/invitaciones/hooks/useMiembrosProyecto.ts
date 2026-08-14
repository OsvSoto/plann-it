import { useCallback, useEffect, useState } from 'react'

import { obtenerMiembrosProyecto } from '../services/invitacion.service'

import type { MiembroProyecto } from '../types'

export function useMiembrosProyecto(proyectoId: string) {
  const [miembros, setMiembros] = useState<MiembroProyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarMiembros = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      setMiembros(await obtenerMiembrosProyecto(proyectoId))
    } catch (error) {
      console.error('Error al cargar miembros:', error)
      setError('No fue posible cargar el equipo del proyecto.')
    } finally {
      setCargando(false)
    }
  }, [proyectoId])

  useEffect(() => {
    void cargarMiembros()
  }, [cargarMiembros])

  return {
    miembros,
    cargando,
    error,
    cargarMiembros,
  }
}
