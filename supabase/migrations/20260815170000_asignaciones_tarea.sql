CREATE OR REPLACE FUNCTION public.obtener_asignaciones_proyecto(p_proyecto_id uuid)
RETURNS TABLE (
  asignacion_id uuid,
  tarea_id uuid,
  miembro_proyecto_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  usuario_correo text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    asignacion.asignacion_tarea_id,
    asignacion.asignacion_tarea_tarea_id,
    miembro.miembro_proyecto_id,
    usuario.usuario_id,
    usuario.usuario_nombre,
    usuario.usuario_correo
  FROM public.asignaciontarea AS asignacion
  JOIN public.tarea AS tarea
    ON tarea.tarea_id = asignacion.asignacion_tarea_tarea_id
  JOIN public.lista AS lista
    ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero
    ON tablero.tablero_id = lista.lista_tablero_id
  JOIN public.miembroproyecto AS miembro
    ON miembro.miembro_proyecto_id = asignacion.asignacion_tarea_miembro_id
  JOIN public.usuario AS usuario
    ON usuario.usuario_id = miembro.miembro_proyecto_usuario_id
  WHERE public.es_miembro_proyecto(p_proyecto_id)
    AND miembro.miembro_proyecto_proyecto_id = p_proyecto_id
    AND tablero.tablero_proyecto_id = p_proyecto_id
    AND asignacion.asignacion_tarea_active
  ORDER BY lower(usuario.usuario_nombre);
$$;

CREATE OR REPLACE FUNCTION public.asignar_miembro_tarea(
  p_tarea_id uuid,
  p_miembro_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_id uuid;
  v_fecha_entrega date;
  v_asignacion_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para asignar una tarea';
  END IF;

  SELECT
    tablero.tablero_proyecto_id,
    tarea.tarea_fecha_entrega
  INTO
    v_proyecto_id,
    v_fecha_entrega
  FROM public.tarea AS tarea
  JOIN public.lista AS lista
    ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero
    ON tablero.tablero_id = lista.lista_tablero_id
  WHERE tarea.tarea_id = p_tarea_id
  FOR UPDATE OF tarea;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'La tarea no existe';
  END IF;

  IF NOT public.es_lider_proyecto(v_proyecto_id) THEN
    RAISE EXCEPTION 'Solo un líder puede asignar responsables';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS miembro
    WHERE miembro.miembro_proyecto_id = p_miembro_id
      AND miembro.miembro_proyecto_proyecto_id = v_proyecto_id
  ) THEN
    RAISE EXCEPTION 'El responsable no pertenece al proyecto';
  END IF;

  SELECT asignacion.asignacion_tarea_id
  INTO v_asignacion_id
  FROM public.asignaciontarea AS asignacion
  WHERE asignacion.asignacion_tarea_tarea_id = p_tarea_id
    AND asignacion.asignacion_tarea_miembro_id = p_miembro_id
    AND asignacion.asignacion_tarea_active
  LIMIT 1;

  IF v_asignacion_id IS NOT NULL THEN
    RETURN v_asignacion_id;
  END IF;

  INSERT INTO public.asignaciontarea (
    asignacion_tarea_miembro_id,
    asignacion_tarea_tarea_id,
    asignacion_tarea_fin,
    asignacion_tarea_active
  )
  VALUES (
    p_miembro_id,
    p_tarea_id,
    v_fecha_entrega::timestamp AT TIME ZONE 'UTC',
    true
  )
  RETURNING asignacion_tarea_id
  INTO v_asignacion_id;

  RETURN v_asignacion_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.desasignar_miembro_tarea(p_asignacion_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para modificar una asignación';
  END IF;

  SELECT tablero.tablero_proyecto_id
  INTO v_proyecto_id
  FROM public.asignaciontarea AS asignacion
  JOIN public.tarea AS tarea
    ON tarea.tarea_id = asignacion.asignacion_tarea_tarea_id
  JOIN public.lista AS lista
    ON lista.lista_id = tarea.tarea_lista_id
  JOIN public.tablero AS tablero
    ON tablero.tablero_id = lista.lista_tablero_id
  WHERE asignacion.asignacion_tarea_id = p_asignacion_id
    AND asignacion.asignacion_tarea_active
  FOR UPDATE OF asignacion, tarea;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'La asignación activa no existe';
  END IF;

  IF NOT public.es_lider_proyecto(v_proyecto_id) THEN
    RAISE EXCEPTION 'Solo un líder puede retirar responsables';
  END IF;

  UPDATE public.asignaciontarea
  SET asignacion_tarea_active = false
  WHERE asignacion_tarea_id = p_asignacion_id;

  RETURN p_asignacion_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sincronizar_fecha_fin_asignaciones_tarea()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.asignaciontarea
  SET asignacion_tarea_fin = NEW.tarea_fecha_entrega::timestamp AT TIME ZONE 'UTC'
  WHERE asignacion_tarea_tarea_id = NEW.tarea_id
    AND asignacion_tarea_active;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS al_actualizar_fecha_entrega_tarea ON public.tarea;

CREATE TRIGGER al_actualizar_fecha_entrega_tarea
AFTER UPDATE OF tarea_fecha_entrega ON public.tarea
FOR EACH ROW
WHEN (OLD.tarea_fecha_entrega IS DISTINCT FROM NEW.tarea_fecha_entrega)
EXECUTE FUNCTION public.sincronizar_fecha_fin_asignaciones_tarea();

CREATE INDEX IF NOT EXISTS asignaciontarea_tarea_active_idx
ON public.asignaciontarea(asignacion_tarea_tarea_id)
WHERE asignacion_tarea_active;

CREATE INDEX IF NOT EXISTS asignaciontarea_miembro_active_idx
ON public.asignaciontarea(asignacion_tarea_miembro_id)
WHERE asignacion_tarea_active;

REVOKE ALL
ON FUNCTION public.obtener_asignaciones_proyecto(uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.asignar_miembro_tarea(uuid, uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.desasignar_miembro_tarea(uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.sincronizar_fecha_fin_asignaciones_tarea()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.obtener_asignaciones_proyecto(uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.asignar_miembro_tarea(uuid, uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.desasignar_miembro_tarea(uuid)
TO authenticated;
