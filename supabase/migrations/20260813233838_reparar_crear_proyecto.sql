CREATE OR REPLACE FUNCTION public.crear_proyecto(
  p_nombre text,
  p_descripcion text,
  p_fecha_fin date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_usuario_id uuid;
  v_proyecto_id uuid;
BEGIN
  v_usuario_id := auth.uid();

  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  INSERT INTO public.proyecto (
    proyecto_nombre,
    proyecto_descripcion,
    proyecto_fecha_inicio,
    proyecto_fecha_fin,
    proyecto_estado
  )
  VALUES (
    p_nombre,
    p_descripcion,
    current_date,
    p_fecha_fin,
    'ACTIVO'
  )
  RETURNING proyecto_id INTO v_proyecto_id;

  INSERT INTO public.miembroproyecto (
    miembro_proyecto_usuario_id,
    miembro_proyecto_proyecto_id,
    miembro_proyecto_rol,
    miembro_proyecto_permisos
  )
  VALUES (
    v_usuario_id,
    v_proyecto_id,
    'LIDER',
    'TOTAL'
  );

  RETURN v_proyecto_id;
END;
$$;

REVOKE ALL
ON FUNCTION public.crear_proyecto(text, text, date)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.crear_proyecto(text, text, date)
TO authenticated;
