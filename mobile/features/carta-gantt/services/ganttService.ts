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