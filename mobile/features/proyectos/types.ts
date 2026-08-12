export type Proyecto = {
  proyecto_id: string
  proyecto_nombre: string
  proyecto_descripcion: string | null
  proyecto_fecha_inicio: string
  proyecto_fecha_fin: string
  proyecto_estado: string
}

export type CrearProyectoInput = {
  nombre: string
  descripcion: string
  fechaFin: string
}