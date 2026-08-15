import { useCallback, useEffect, useState } from 'react'

import { obtenerMiembrosProyecto } from '../../invitaciones/services/invitacion.service'
import {
  asignarMiembroTarea,
  desasignarMiembroTarea,
  obtenerAsignacionesProyecto,
} from '../services/asignacion.service'

import type { MiembroProyecto } from '../../invitaciones/types'
import type { AsignacionTarea } from '../types'

type Parametros = {
  visible: boolean
  proyectoId: string
  tareaId: string | null
  onChanged: () => Promise<void>
}

export function useAsignacionesTarea({
  visible,
  proyectoId,
  tareaId,
  onChanged,
}: Parametros) {
  const [miembros, setMiembros] = useState<MiembroProyecto[]>([])
  const [asignaciones, setAsignaciones] = useState<AsignacionTarea[]>([])
  const [cargando, setCargando] = useState(false)
  const [procesandoMiembroId, setProcesandoMiembroId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!visible || !tareaId) {
      return
    }

    try {
      setCargando(true)
      setError(null)
      const [miembrosProyecto, asignacionesProyecto] = await Promise.all([
        obtenerMiembrosProyecto(proyectoId),
        obtenerAsignacionesProyecto(proyectoId),
      ])
      setMiembros(miembrosProyecto)
      setAsignaciones(
        asignacionesProyecto.filter((asignacion) => asignacion.tarea_id === tareaId)
      )
    } catch (error) {
      console.error('Error al cargar responsables:', error)
      setError('No fue posible cargar los responsables de la tarea.')
    } finally {
      setCargando(false)
    }
  }, [proyectoId, tareaId, visible])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function alternar(miembro: MiembroProyecto) {
    if (!tareaId || procesandoMiembroId) {
      return
    }

    const asignacion = asignaciones.find(
      (actual) => actual.miembro_proyecto_id === miembro.miembro_proyecto_id
    )

    try {
      setProcesandoMiembroId(miembro.miembro_proyecto_id)
      setError(null)

      if (asignacion) {
        await desasignarMiembroTarea(asignacion.asignacion_id)
        setAsignaciones((actuales) => actuales.filter(
          (actual) => actual.asignacion_id !== asignacion.asignacion_id
        ))
      } else {
        const asignacionId = await asignarMiembroTarea(
          tareaId,
          miembro.miembro_proyecto_id
        )
        setAsignaciones((actuales) => [
          ...actuales,
          {
            asignacion_id: asignacionId,
            tarea_id: tareaId,
            miembro_proyecto_id: miembro.miembro_proyecto_id,
            usuario_id: miembro.usuario_id,
            usuario_nombre: miembro.usuario_nombre,
            usuario_correo: miembro.usuario_correo,
          },
        ])
      }

      await onChanged()
    } catch (error) {
      console.error('Error al modificar responsables:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible modificar la asignación.'
      )
    } finally {
      setProcesandoMiembroId(null)
    }
  }

  return {
    miembros,
    asignaciones,
    cargando,
    procesandoMiembroId,
    error,
    cargar,
    alternar,
  }
}
