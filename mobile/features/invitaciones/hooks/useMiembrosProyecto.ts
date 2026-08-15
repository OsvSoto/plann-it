import { useCallback, useEffect, useState } from 'react'

import {
  obtenerMiembrosProyecto,
  obtenerUsuarioActualId,
} from '../services/invitacion.service'

import type { MiembroProyecto } from '../types'

export function useMiembrosProyecto(proyectoId: string) {
  const [miembros, setMiembros] = useState<MiembroProyecto[]>([])
  const [usuarioActualId, setUsuarioActualId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarMiembros = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const [miembrosProyecto, usuarioId] = await Promise.all([
        obtenerMiembrosProyecto(proyectoId),
        obtenerUsuarioActualId(),
      ])
      setMiembros(miembrosProyecto)
      setUsuarioActualId(usuarioId)
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
    usuarioActualId,
    cargando,
    error,
    cargarMiembros,
  }
}
