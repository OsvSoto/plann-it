import type { EstadoTarea } from '../proyectos/types';

export interface TareaGantt {
  id_tarea: string;
  nombre_tarea: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoTarea;
  asignado: string | null;
}
