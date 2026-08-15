import type { Tables } from '../../lib/database.types'

export type Proyecto = Tables<'proyecto'>

export type AsignacionTarea = {
  asignacion_id: string
  tarea_id: string
  miembro_proyecto_id: string
  usuario_id: string
  usuario_nombre: string
  usuario_correo: string
}

export type Tarea = Tables<'tarea'> & {
  asignaciones: AsignacionTarea[]
}

export type ListaDetalle = Tables<'lista'> & {
  tareas: Tarea[]
}

export type TableroDetalle = Tables<'tablero'> & {
  listas: ListaDetalle[]
}

export type DetalleProyecto = {
  proyecto: Proyecto
  tableros: TableroDetalle[]
  esLider: boolean
  puedeEliminarProyecto: boolean
}

export type CrearProyectoInput = {
  nombre: string
  descripcion: string
  fechaFin: string
}

export type CrearTableroInput = {
  proyectoId: string
  nombre: string
}

export type CrearListaInput = {
  tableroId: string
  nombre: string
  orden: number
}

export const ESTADOS_TAREA = [
  'PENDIENTE',
  'EN_PROGRESO',
  'COMPLETADA',
] as const

export type EstadoTarea = (typeof ESTADOS_TAREA)[number]

export type CrearTareaInput = {
  listaId: string
  nombre: string
  descripcion: string | null
  estado: EstadoTarea
  fechaEntrega: string
}

export type EditarTareaInput = Omit<CrearTareaInput, 'listaId'> & {
  tareaId: string
}
