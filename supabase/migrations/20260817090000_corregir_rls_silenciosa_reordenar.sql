-- Corrige reordenar_listas y reordenar_tareas: antes, si RLS bloqueaba el
-- UPDATE de una fila (p. ej. un miembro sin permiso sobre una tarea ajena
-- asignada a otro usuario), esa fila se quedaba con el orden viejo sin que
-- la función lo notara, dejando el tablero/lista en un orden mezclado sin
-- avisar al usuario. Ahora se verifica ROW_COUNT tras cada UPDATE y se
-- aborta toda la operación (rollback automático del loop completo) si
-- alguna fila no pudo actualizarse.

CREATE OR REPLACE FUNCTION public.reordenar_listas(
  p_tablero_id uuid,
  p_orden jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  registro record;
  filas_afectadas integer;
BEGIN
  FOR registro IN
    SELECT * FROM jsonb_to_recordset(p_orden) AS x(lista_id uuid, orden integer)
  LOOP
    UPDATE public.lista
    SET lista_orden = registro.orden
    WHERE lista_id = registro.lista_id
      AND lista_tablero_id = p_tablero_id;

    GET DIAGNOSTICS filas_afectadas = ROW_COUNT;

    IF filas_afectadas = 0 THEN
      RAISE EXCEPTION 'No tienes permiso para reordenar la lista %', registro.lista_id
        USING ERRCODE = '42501';
    END IF;
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
  filas_afectadas integer;
BEGIN
  FOR registro IN
    SELECT * FROM jsonb_to_recordset(p_orden) AS x(tarea_id uuid, orden integer)
  LOOP
    UPDATE public.tarea
    SET tarea_orden = registro.orden
    WHERE tarea_id = registro.tarea_id
      AND tarea_lista_id = p_lista_id;

    GET DIAGNOSTICS filas_afectadas = ROW_COUNT;

    IF filas_afectadas = 0 THEN
      RAISE EXCEPTION 'No tienes permiso para reordenar la tarea %', registro.tarea_id
        USING ERRCODE = '42501';
    END IF;
  END LOOP;
END;
$$;
