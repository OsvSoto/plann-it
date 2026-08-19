-- crear_dependencia_tarea no validaba que la predecesora ya terminara antes
-- de que la sucesora empezara, permitiendo enlazar una tarea posterior en el
-- tiempo como si fuera un requisito previo de una anterior. La resta ya
-- programada con fechas confirmadas (drift posterior por edicion de fechas)
-- sigue permitida y solo se marca visualmente en el Gantt; lo que se corrige
-- aqui es que nazca en conflicto.
CREATE OR REPLACE FUNCTION public.crear_dependencia_tarea(
  p_predecesora_id uuid,
  p_sucesora_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_predecesora uuid;
  v_proyecto_sucesora uuid;
  v_fecha_fin_predecesora date;
  v_fecha_inicio_sucesora date;
  v_dependencia_id uuid;
  v_ciclo boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion para gestionar dependencias';
  END IF;

  IF p_predecesora_id = p_sucesora_id THEN
    RAISE EXCEPTION 'Una tarea no puede depender de si misma';
  END IF;

  SELECT tablero.tablero_proyecto_id, tarea.tarea_fecha_entrega
  INTO v_proyecto_predecesora, v_fecha_fin_predecesora
  FROM public.tarea AS tarea
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tarea.tarea_id = p_predecesora_id;

  SELECT tablero.tablero_proyecto_id, tarea.tarea_fecha_inicio
  INTO v_proyecto_sucesora, v_fecha_inicio_sucesora
  FROM public.tarea AS tarea
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tarea.tarea_id = p_sucesora_id;

  IF v_proyecto_predecesora IS NULL OR v_proyecto_sucesora IS NULL THEN
    RAISE EXCEPTION 'Alguna de las tareas no existe';
  END IF;

  IF v_proyecto_predecesora <> v_proyecto_sucesora THEN
    RAISE EXCEPTION 'Ambas tareas deben pertenecer al mismo proyecto';
  END IF;

  IF NOT public.es_lider_proyecto(v_proyecto_predecesora) THEN
    RAISE EXCEPTION 'Solo el lider o co-lider pueden enlazar tareas';
  END IF;

  IF v_fecha_fin_predecesora > v_fecha_inicio_sucesora THEN
    RAISE EXCEPTION 'La tarea predecesora debe terminar antes de que empiece la sucesora';
  END IF;

  PERFORM dep.tarea_dependencia_id
  FROM public.tareadependencia AS dep
  JOIN public.tarea AS tarea ON tarea.tarea_id = dep.tarea_dependencia_sucesora_id
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tablero.tablero_proyecto_id = v_proyecto_predecesora
  ORDER BY dep.tarea_dependencia_id
  FOR UPDATE;

  WITH RECURSIVE alcanzables AS (
    SELECT dep.tarea_dependencia_sucesora_id AS tarea_id
    FROM public.tareadependencia AS dep
    WHERE dep.tarea_dependencia_predecesora_id = p_sucesora_id

    UNION

    SELECT dep.tarea_dependencia_sucesora_id
    FROM public.tareadependencia AS dep
    JOIN alcanzables ON alcanzables.tarea_id = dep.tarea_dependencia_predecesora_id
  )
  SELECT EXISTS (
    SELECT 1 FROM alcanzables WHERE tarea_id = p_predecesora_id
  )
  INTO v_ciclo;

  IF v_ciclo THEN
    RAISE EXCEPTION 'Esta dependencia crearia un ciclo entre tareas';
  END IF;

  INSERT INTO public.tareadependencia (
    tarea_dependencia_predecesora_id,
    tarea_dependencia_sucesora_id
  )
  VALUES (p_predecesora_id, p_sucesora_id)
  ON CONFLICT (tarea_dependencia_predecesora_id, tarea_dependencia_sucesora_id)
  DO UPDATE SET tarea_dependencia_predecesora_id = EXCLUDED.tarea_dependencia_predecesora_id
  RETURNING tarea_dependencia_id
  INTO v_dependencia_id;

  RETURN v_dependencia_id;
END;
$$;
