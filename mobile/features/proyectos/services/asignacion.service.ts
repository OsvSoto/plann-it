import { supabase } from '../../../lib/supabase'

import type { AsignacionTarea } from '../types'

export async function obtenerAsignacionesProyecto(
  proyectoId: string
): Promise<AsignacionTarea[]> {
  const { data, error } = await supabase.rpc(
    'obtener_asignaciones_proyecto',
    { p_proyecto_id: proyectoId }
  )

  if (error) {
    throw error
  }

  return data ?? []
}

export async function asignarMiembroTarea(
  tareaId: string,
  miembroId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('asignar_miembro_tarea', {
    p_tarea_id: tareaId,
    p_miembro_id: miembroId,
  })

  if (error) {
    throw error
  }

  return data
}

export async function desasignarMiembroTarea(
  asignacionId: string
): Promise<void> {
  const { error } = await supabase.rpc('desasignar_miembro_tarea', {
    p_asignacion_id: asignacionId,
  })

  if (error) {
    throw error
  }
}
