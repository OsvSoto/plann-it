-- Se descarta la funcionalidad de dependencias entre tareas del Gantt (UX no
-- convencio al usuario). tarea_fecha_inicio se mantiene: la usa el Gantt
-- para mostrar duraciones reales, independientemente de las dependencias.
DROP FUNCTION IF EXISTS public.crear_dependencia_tarea(uuid, uuid);
DROP FUNCTION IF EXISTS public.eliminar_dependencia_tarea(uuid);
DROP FUNCTION IF EXISTS public.obtener_dependencias_proyecto(uuid);
DROP TABLE IF EXISTS public.tareadependencia;
