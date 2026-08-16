-- Agrega orden a las tareas y RPCs para persistir el reordenamiento
-- (drag-and-drop) de listas y tareas.

ALTER TABLE public.tarea
  ADD COLUMN tarea_orden integer NOT NULL DEFAULT 0;

ALTER TABLE public.tarea
  ADD CONSTRAINT tarea_orden_no_negativo CHECK (tarea_orden >= 0);

WITH ordenado AS (
  SELECT
    tarea_id,
    ROW_NUMBER() OVER (PARTITION BY tarea_lista_id ORDER BY tarea_id) - 1 AS rn
  FROM public.tarea
)
UPDATE public.tarea t
SET tarea_orden = ordenado.rn
FROM ordenado
WHERE t.tarea_id = ordenado.tarea_id;

CREATE OR REPLACE FUNCTION public.reordenar_listas(
  p_tablero_id uuid,
  p_orden jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  registro record;
BEGIN
  FOR registro IN
    SELECT * FROM jsonb_to_recordset(p_orden) AS x(lista_id uuid, orden integer)
  LOOP
    UPDATE public.lista
    SET lista_orden = registro.orden
    WHERE lista_id = registro.lista_id
      AND lista_tablero_id = p_tablero_id;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reordenar_tareas(
  p_lista_id uuid,
  p_orden jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  registro record;
BEGIN
  FOR registro IN
    SELECT * FROM jsonb_to_recordset(p_orden) AS x(tarea_id uuid, orden integer)
  LOOP
    UPDATE public.tarea
    SET tarea_orden = registro.orden
    WHERE tarea_id = registro.tarea_id
      AND tarea_lista_id = p_lista_id;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reordenar_listas(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reordenar_tareas(uuid, jsonb) TO authenticated;
