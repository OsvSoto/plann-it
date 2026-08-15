export interface TareaGantt {
  id_tarea: string;
  nombre_tarea: string;
  fecha_inicio: string;
  fecha_fin: string;
  asignado: string | null;
  color: string | null;
}

export interface ProyectoGantt {
  fecha_inicio: string;
  fecha_fin: string;
  tareas: TareaGantt[];
}