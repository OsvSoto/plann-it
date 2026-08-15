import { supabase } from '../../../lib/supabase'
import { obtenerAsignacionesProyecto } from './asignacion.service'

import type {
  CrearListaInput,
  CrearProyectoInput,
  CrearTableroInput,
  CrearTareaInput,
  DetalleProyecto,
  EditarTareaInput,
  Proyecto,
  TableroDetalle,
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
      p_nombre: proyecto.nombre.trim(),
      p_descripcion: proyecto.descripcion,
      p_fecha_fin: proyecto.fechaFin,
    }
  )

  if (error) {
    throw error
  }

  if (typeof data !== 'string') {
    throw new Error('La RPC crear_proyecto no devolvió un identificador')
  }

  return data
}

export async function obtenerDetalleProyecto(
  proyectoId: string
): Promise<DetalleProyecto> {
  const [
    proyectoResultado,
    tablerosResultado,
    liderResultado,
    puedeEliminarResultado,
    asignacionesResultado,
  ] = await Promise.all([
    supabase
      .from('proyecto')
      .select(`
        proyecto_id,
        proyecto_nombre,
        proyecto_descripcion,
        proyecto_fecha_inicio,
        proyecto_fecha_fin,
        proyecto_estado
      `)
      .eq('proyecto_id', proyectoId)
      .single(),
    supabase
      .from('tablero')
      .select(`
        tablero_id,
        tablero_proyecto_id,
        tablero_nombre,
        lista (
          lista_id,
          lista_tablero_id,
          lista_nombre,
          lista_orden,
          tarea (
            tarea_id,
            tarea_lista_id,
            tarea_nombre,
            tarea_desc,
            tarea_estado,
            tarea_fecha_entrega
          )
        )
      `)
      .eq('tablero_proyecto_id', proyectoId)
      .order('tablero_nombre', { ascending: true }),
    supabase.rpc('es_lider_proyecto', {
      p_proyecto_id: proyectoId,
    }),
    supabase.rpc('puede_eliminar_proyecto', {
      p_proyecto_id: proyectoId,
    }),
    obtenerAsignacionesProyecto(proyectoId),
  ])

  if (proyectoResultado.error) {
    throw proyectoResultado.error
  }

  if (tablerosResultado.error) {
    throw tablerosResultado.error
  }

  if (liderResultado.error) {
    throw liderResultado.error
  }

  if (puedeEliminarResultado.error) {
    throw puedeEliminarResultado.error
  }

  const asignacionesPorTarea = new Map<string, typeof asignacionesResultado>()

  asignacionesResultado.forEach((asignacion) => {
    const asignaciones = asignacionesPorTarea.get(asignacion.tarea_id) ?? []
    asignaciones.push(asignacion)
    asignacionesPorTarea.set(asignacion.tarea_id, asignaciones)
  })

  const tableros: TableroDetalle[] = (tablerosResultado.data ?? []).map(
    (tablero) => ({
      tablero_id: tablero.tablero_id,
      tablero_proyecto_id: tablero.tablero_proyecto_id,
      tablero_nombre: tablero.tablero_nombre,
      listas: [...tablero.lista]
        .sort((a, b) => a.lista_orden - b.lista_orden)
        .map((lista) => ({
          lista_id: lista.lista_id,
          lista_tablero_id: lista.lista_tablero_id,
          lista_nombre: lista.lista_nombre,
          lista_orden: lista.lista_orden,
          tareas: lista.tarea.map((tarea) => ({
            ...tarea,
            asignaciones: asignacionesPorTarea.get(tarea.tarea_id) ?? [],
          })),
        })),
    })
  )

  return {
    proyecto: proyectoResultado.data,
    tableros,
    esLider: liderResultado.data,
    puedeEliminarProyecto: puedeEliminarResultado.data,
  }
}

export async function crearTablero(
  tablero: CrearTableroInput
): Promise<TableroDetalle> {
  const { data, error } = await supabase
    .from('tablero')
    .insert({
      tablero_proyecto_id: tablero.proyectoId,
      tablero_nombre: tablero.nombre.trim(),
    })
    .select(`
      tablero_id,
      tablero_proyecto_id,
      tablero_nombre
    `)
    .single()

  if (error) {
    throw error
  }

  return {
    ...data,
    listas: [],
  }
}

export async function crearLista(
  lista: CrearListaInput
): Promise<void> {
  const { error } = await supabase
    .from('lista')
    .insert({
      lista_tablero_id: lista.tableroId,
      lista_nombre: lista.nombre.trim(),
      lista_orden: lista.orden,
    })

  if (error) {
    throw error
  }
}

export async function crearTarea(
  tarea: CrearTareaInput
): Promise<void> {
  const { error } = await supabase
    .from('tarea')
    .insert({
      tarea_lista_id: tarea.listaId,
      tarea_nombre: tarea.nombre.trim(),
      tarea_desc: tarea.descripcion,
      tarea_estado: tarea.estado,
      tarea_fecha_entrega: tarea.fechaEntrega,
    })

  if (error) {
    throw error
  }
}

export async function actualizarTarea(
  tarea: EditarTareaInput
): Promise<void> {
  const { error } = await supabase
    .from('tarea')
    .update({
      tarea_nombre: tarea.nombre.trim(),
      tarea_desc: tarea.descripcion,
      tarea_estado: tarea.estado,
      tarea_fecha_entrega: tarea.fechaEntrega,
    })
    .eq('tarea_id', tarea.tareaId)
    .select('tarea_id')
    .single()

  if (error) {
    throw error
  }
}

export async function eliminarTarea(tareaId: string): Promise<void> {
  const { error } = await supabase
    .from('tarea')
    .delete()
    .eq('tarea_id', tareaId)
    .select('tarea_id')
    .single()

  if (error) {
    throw error
  }
}

export async function eliminarLista(listaId: string): Promise<void> {
  const { error } = await supabase
    .from('lista')
    .delete()
    .eq('lista_id', listaId)
    .select('lista_id')
    .single()

  if (error) {
    throw error
  }
}

export async function eliminarProyecto(proyectoId: string): Promise<void> {
  const { error } = await supabase
    .from('proyecto')
    .delete()
    .eq('proyecto_id', proyectoId)
    .select('proyecto_id')
    .single()

  if (error) {
    throw error
  }
}
