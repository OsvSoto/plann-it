CREATE OR REPLACE FUNCTION public.actualizar_miembro_proyecto(
  p_miembro_id uuid,
  p_rol text,
  p_permisos text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_id uuid;
  v_rol_actual text;
  v_rol_nuevo text := upper(trim(p_rol));
  v_permisos_nuevos text := upper(trim(p_permisos));
  v_cantidad_lideres integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion para administrar miembros';
  END IF;

  IF v_rol_nuevo IS NULL
    OR v_permisos_nuevos IS NULL
    OR NOT (
    (v_rol_nuevo = 'LIDER' AND v_permisos_nuevos = 'TOTAL')
    OR (v_rol_nuevo = 'MIEMBRO' AND v_permisos_nuevos = 'COLABORAR')
    ) THEN
    RAISE EXCEPTION 'La combinacion de rol y permisos no es valida';
  END IF;

  SELECT miembro.miembro_proyecto_proyecto_id
  INTO v_proyecto_id
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_id = p_miembro_id;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'El miembro no existe';
  END IF;

  -- Serializa cambios de liderazgo dentro del proyecto.
  PERFORM miembro.miembro_proyecto_id
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_proyecto_id = v_proyecto_id
  ORDER BY miembro.miembro_proyecto_id
  FOR UPDATE;

  SELECT miembro.miembro_proyecto_rol
  INTO v_rol_actual
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_id = p_miembro_id
    AND miembro.miembro_proyecto_proyecto_id = v_proyecto_id;

  IF v_rol_actual IS NULL THEN
    RAISE EXCEPTION 'El miembro ya no pertenece al proyecto';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_usuario_id = auth.uid()
      AND lider.miembro_proyecto_rol = 'LIDER'
  ) THEN
    RAISE EXCEPTION 'Solo un lider puede administrar miembros';
  END IF;

  IF v_rol_actual = 'LIDER' AND v_rol_nuevo <> 'LIDER' THEN
    SELECT count(*)
    INTO v_cantidad_lideres
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_rol = 'LIDER';

    IF v_cantidad_lideres <= 1 THEN
      RAISE EXCEPTION 'El proyecto debe conservar al menos un lider';
    END IF;
  END IF;

  UPDATE public.miembroproyecto
  SET
    miembro_proyecto_rol = v_rol_nuevo,
    miembro_proyecto_permisos = v_permisos_nuevos
  WHERE miembro_proyecto_id = p_miembro_id;

  RETURN p_miembro_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.eliminar_miembro_proyecto(p_miembro_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_proyecto_id uuid;
  v_rol_actual text;
  v_cantidad_lideres integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion para administrar miembros';
  END IF;

  SELECT miembro.miembro_proyecto_proyecto_id
  INTO v_proyecto_id
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_id = p_miembro_id;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'El miembro no existe';
  END IF;

  -- Bloquear todas las membresias evita retirar simultaneamente a los ultimos lideres.
  PERFORM miembro.miembro_proyecto_id
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_proyecto_id = v_proyecto_id
  ORDER BY miembro.miembro_proyecto_id
  FOR UPDATE;

  SELECT miembro.miembro_proyecto_rol
  INTO v_rol_actual
  FROM public.miembroproyecto AS miembro
  WHERE miembro.miembro_proyecto_id = p_miembro_id
    AND miembro.miembro_proyecto_proyecto_id = v_proyecto_id;

  IF v_rol_actual IS NULL THEN
    RAISE EXCEPTION 'El miembro ya no pertenece al proyecto';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_usuario_id = auth.uid()
      AND lider.miembro_proyecto_rol = 'LIDER'
  ) THEN
    RAISE EXCEPTION 'Solo un lider puede administrar miembros';
  END IF;

  IF v_rol_actual = 'LIDER' THEN
    SELECT count(*)
    INTO v_cantidad_lideres
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_rol = 'LIDER';

    IF v_cantidad_lideres <= 1 THEN
      RAISE EXCEPTION 'No puedes eliminar al unico lider del proyecto';
    END IF;
  END IF;

  -- Las asignaciones se eliminan por la FK ON DELETE CASCADE; las tareas permanecen.
  DELETE FROM public.miembroproyecto
  WHERE miembro_proyecto_id = p_miembro_id;

  RETURN p_miembro_id;
END;
$$;

REVOKE ALL
ON FUNCTION public.actualizar_miembro_proyecto(uuid, text, text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.eliminar_miembro_proyecto(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.actualizar_miembro_proyecto(uuid, text, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.eliminar_miembro_proyecto(uuid)
TO authenticated;
