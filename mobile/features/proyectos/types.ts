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
  miUsuarioId: string | null
}

export type CrearProyectoInput = {
  nombre: string
  descripcion: string
  fechaFin: string
}

export type EditarProyectoInput = {
  proyectoId: string
  nombre: string
  descripcion: string
  fechaFin: string
  estado: EstadoProyecto
}

export type CrearTableroInput = {
  proyectoId: string
  nombre: string
}

export type EditarTableroInput = {
  tableroId: string
  nombre: string
}

export type CrearListaInput = {
  tableroId: string
  nombre: string
  orden: number
}

export type OrdenLista = {
  listaId: string
  orden: number
}

export type OrdenTarea = {
  tareaId: string
  orden: number
}

export const ESTADOS_TAREA = [
  'PENDIENTE',
  'EN_PROGRESO',
  'COMPLETADA',
] as const

export type EstadoTarea = (typeof ESTADOS_TAREA)[number]

export const ESTADOS_PROYECTO = [
  'ACTIVO',
  'PAUSADO',
  'COMPLETADO',
  'ARCHIVADO',
] as const

export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number]

export const ESTADO_PROYECTO_COLORS: Record<
  EstadoProyecto,
  { color: string; background: string }
> = {
  ACTIVO: { color: '#2E9B5F', background: '#E3F3E9' },
  PAUSADO: { color: '#B8860B', background: '#FBF0DA' },
  COMPLETADO: { color: '#3B6FC4', background: '#E4EBFA' },
  ARCHIVADO: { color: '#6B6470', background: '#ECE8EF' },
}

export type CrearTareaInput = {
  listaId: string
  nombre: string
  descripcion: string | null
  estado: EstadoTarea
  fechaEntrega: string
  orden: number
}

export type EditarTareaInput = Omit<CrearTareaInput, 'listaId' | 'orden'> & {
  tareaId: string
}


