import { supabase } from '../../../lib/supabase'

import type {
  CrearProyectoInput,
  Proyecto,
} from '../types'

export async function obtenerProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase
    .from('proyecto')
    .select(`
      proyecto_id,
      proyecto_nombre,
      proyecto_descripcion,
      proyecto_fecha_inicio,
      proyecto_fecha_fin,
      proyecto_estado
    `)
    .order('proyecto_fecha_inicio', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function crearProyecto(
  proyecto: CrearProyectoInput
): Promise<string> {
  const { data, error } = await supabase.rpc(
    'crear_proyecto',
    {
      p_nombre: proyecto.nombre,
      p_descripcion: proyecto.descripcion,
      p_fecha_fin: proyecto.fechaFin,
    }
  )

  if (error) {
    throw error
  }

  return data
}