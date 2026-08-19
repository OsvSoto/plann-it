-- Fecha de inicio real por tarea (antes solo existia tarea_fecha_entrega, por
-- lo que el Gantt no podia representar duraciones ni por lo tanto
-- dependencias con sentido). Se rellenan las filas existentes con la fecha
-- de entrega (duracion cero, igual al comportamiento visual previo) y luego
-- se exige NOT NULL para las tareas nuevas.
ALTER TABLE public.tarea
  ADD COLUMN IF NOT EXISTS tarea_fecha_inicio date;

UPDATE public.tarea
SET tarea_fecha_inicio = tarea_fecha_entrega
WHERE tarea_fecha_inicio IS NULL;

ALTER TABLE public.tarea
  ALTER COLUMN tarea_fecha_inicio SET NOT NULL;

ALTER TABLE public.tarea
  ADD CONSTRAINT tarea_fecha_inicio_antes_entrega
    CHECK (tarea_fecha_inicio <= tarea_fecha_entrega);

-- Dependencias entre tareas (fin-a-inicio: la predecesora debe terminar
-- antes de que empiece la sucesora). Sigue el mismo patron que
-- asignaciontarea: RLS habilitado sin policies, toda la lectura/escritura
-- pasa por RPC SECURITY DEFINER.
CREATE TABLE public.tareadependencia (
  tarea_dependencia_id             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  tarea_dependencia_predecesora_id uuid                     NOT NULL,
  tarea_dependencia_sucesora_id    uuid                     NOT NULL,
  tarea_dependencia_creado_en      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.tareadependencia
  ADD CONSTRAINT tareadependencia_pkey PRIMARY KEY (tarea_dependencia_id);

ALTER TABLE public.tareadependencia
  ADD CONSTRAINT tareadependencia_predecesora_id_fkey
    FOREIGN KEY (tarea_dependencia_predecesora_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

ALTER TABLE public.tareadependencia
  ADD CONSTRAINT tareadependencia_sucesora_id_fkey
    FOREIGN KEY (tarea_dependencia_sucesora_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

ALTER TABLE public.tareadependencia
  ADD CONSTRAINT tareadependencia_no_autodependencia
    CHECK (tarea_dependencia_predecesora_id <> tarea_dependencia_sucesora_id);

ALTER TABLE public.tareadependencia
  ADD CONSTRAINT tareadependencia_unica
    UNIQUE (tarea_dependencia_predecesora_id, tarea_dependencia_sucesora_id);

ALTER TABLE public.tareadependencia ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.tareadependencia TO service_role;

CREATE INDEX IF NOT EXISTS tareadependencia_sucesora_idx
  ON public.tareadependencia(tarea_dependencia_sucesora_id);

-- Lista las dependencias de un proyecto (cualquier miembro puede verlas).
CREATE OR REPLACE FUNCTION public.obtener_dependencias_proyecto(p_proyecto_id uuid)
RETURNS TABLE (
  tarea_dependencia_id uuid,
  predecesora_id uuid,
  sucesora_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    dep.tarea_dependencia_id,
    dep.tarea_dependencia_predecesora_id,
    dep.tarea_dependencia_sucesora_id
  FROM public.tareadependencia AS dep
  JOIN public.tarea AS tarea
    ON tarea.tarea_id = dep.tarea_dependencia_sucesora_id
  JOIN public.lista AS lista
    ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero
    ON tablero.tablero_id = lista.lista_tablero_id
  WHERE public.es_miembro_proyecto(p_proyecto_id)
    AND tablero.tablero_proyecto_id = p_proyecto_id;
$$;

-- Crea una dependencia fin-a-inicio entre dos tareas del mismo proyecto.
-- Rechaza autodependencias y ciclos (directos o transitivos).
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
  v_dependencia_id uuid;
  v_ciclo boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion para gestionar dependencias';
  END IF;

  IF p_predecesora_id = p_sucesora_id THEN
    RAISE EXCEPTION 'Una tarea no puede depender de si misma';
  END IF;

  SELECT tablero.tablero_proyecto_id
  INTO v_proyecto_predecesora
  FROM public.tarea AS tarea
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tarea.tarea_id = p_predecesora_id;

  SELECT tablero.tablero_proyecto_id
  INTO v_proyecto_sucesora
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

  -- Serializa cambios sobre las dependencias del proyecto mientras se
  -- comprueba el ciclo, para evitar condiciones de carrera entre inserts
  -- concurrentes que individualmente parecen validos.
  PERFORM dep.tarea_dependencia_id
  FROM public.tareadependencia AS dep
  JOIN public.tarea AS tarea ON tarea.tarea_id = dep.tarea_dependencia_sucesora_id
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tablero.tablero_proyecto_id = v_proyecto_predecesora
  ORDER BY dep.tarea_dependencia_id
  FOR UPDATE;

  -- Si la sucesora ya alcanza (directa o transitivamente) a la predecesora,
  -- agregar predecesora -> sucesora cerraria un ciclo.
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

-- Elimina una dependencia (solo lider/co-lider del proyecto involucrado).
CREATE OR REPLACE FUNCTION public.eliminar_dependencia_tarea(p_dependencia_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion para gestionar dependencias';
  END IF;

  SELECT tablero.tablero_proyecto_id
  INTO v_proyecto_id
  FROM public.tareadependencia AS dep
  JOIN public.tarea AS tarea ON tarea.tarea_id = dep.tarea_dependencia_predecesora_id
  JOIN public.lista AS lista ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero ON tablero.tablero_id = lista.lista_tablero_id
  WHERE dep.tarea_dependencia_id = p_dependencia_id;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'La dependencia no existe';
  END IF;

  IF NOT public.es_lider_proyecto(v_proyecto_id) THEN
    RAISE EXCEPTION 'Solo el lider o co-lider pueden quitar dependencias';
  END IF;

  DELETE FROM public.tareadependencia
  WHERE tarea_dependencia_id = p_dependencia_id;

  RETURN p_dependencia_id;
END;
$$;

REVOKE ALL
ON FUNCTION public.obtener_dependencias_proyecto(uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.crear_dependencia_tarea(uuid, uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.eliminar_dependencia_tarea(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.obtener_dependencias_proyecto(uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.crear_dependencia_tarea(uuid, uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.eliminar_dependencia_tarea(uuid)
TO authenticated;

-- El RPC obtener_datos_gantt (y su hook/service en el cliente) quedo como
-- codigo muerto: la pantalla de Gantt arma los datos directamente desde
-- obtenerDetalleProyecto y nunca lo llamo.
DROP FUNCTION IF EXISTS public.obtener_datos_gantt(uuid);
