import { useCallback, useState } from 'react';
import { fetchGanttData } from '../services/ganttService';
import { TareaGantt } from '../types';

export const useGantt = (proyectoId: string) => {
  const [tareas, setTareas] = useState<TareaGantt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!proyectoId) return;
    try {
      setLoading(true);
      const data = await fetchGanttData(proyectoId);
      setTareas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  return { tareas, loading, error, cargarDatos };
};