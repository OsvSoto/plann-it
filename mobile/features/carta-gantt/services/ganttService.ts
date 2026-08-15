import { supabase } from '../../../lib/supabase';
import { TareaGantt } from '../types';

export const fetchGanttData = async (proyectoId: string): Promise<TareaGantt[]> => {
  const { data, error } = await supabase
    .rpc('obtener_datos_gantt', { p_id_proyecto: proyectoId });

  if (error) {
    throw new Error(error.message);
  }
  
  return data as TareaGantt[];
};

export const actualizarTareaAsignacionGantt = async (
  tareaId: string,
  datos: {
    nombre: string;
    descripcion: string | null;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
    miembroId: string | null;
    miembroIdAnterior: string | null;
    asignacionId: string | null;
  }
): Promise<void> => {
  const { error: errorTarea } = await supabase
    .from('tarea')
    .update({
      tarea_nombre: datos.nombre.trim(),
      tarea_desc: datos.descripcion,
      tarea_estado: datos.estado,
      tarea_fecha_entrega: datos.fechaFin,
    })
    .eq('tarea_id', tareaId);

  if (errorTarea) throw errorTarea;

  let currentAsignacionId = datos.asignacionId;

  // Si el miembro cambia, usamos los RPC autorizados para no chocar con RLS en INSERT/DELETE
  if (datos.miembroId !== datos.miembroIdAnterior) {
    if (currentAsignacionId) {
      const { error: errDesasignar } = await supabase.rpc('desasignar_miembro_tarea', {
        p_asignacion_id: currentAsignacionId
      });
      if (errDesasignar) throw errDesasignar;
      currentAsignacionId = null;
    }

    if (datos.miembroId) {
      const { data: newId, error: errAsignar } = await supabase.rpc('asignar_miembro_tarea', {
        p_tarea_id: tareaId,
        p_miembro_id: datos.miembroId
      });
      if (errAsignar) throw errAsignar;
      currentAsignacionId = newId;
    }
  }

  // Si hay una asignaci n activa, le seteamos las fechas (UPDATE)
  if (currentAsignacionId && datos.miembroId) {
    const { error: errorFechas } = await supabase
      .from('asignaciontarea')
      .update({
        asignacion_tarea_inicio: datos.fechaInicio,
        asignacion_tarea_fin: datos.fechaFin,
        asignacion_tarea_tarea_id: tareaId, 
        asignacion_tarea_miembro_id: datos.miembroId,
        asignacion_tarea_active: true
      })
      .eq('asignacion_tarea_id', currentAsignacionId);

    if (errorFechas) throw errorFechas;
  }
};