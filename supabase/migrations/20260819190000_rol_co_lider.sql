-- Introduce el rol CO_LIDER: mismos permisos administrativos que LIDER
-- (editar proyecto, tableros, listas, invitaciones, asignaciones, tareas),
-- excepto eliminar el proyecto y gestionar miembros/roles, que quedan
-- exclusivos del LIDER original.
--
-- es_lider_proyecto() es la funcion centralizada que ya gatilla casi todas
-- las policies/RPC administrativas (ver AGENTS.md seccion "Nuevo rol
-- CO_LIDER"), asi que ampliarla basta para propagar el nuevo rol a todos
-- esos puntos sin tocarlos uno por uno.

CREATE OR REPLACE FUNCTION public.es_lider_proyecto(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.miembroproyecto AS mp
      WHERE mp.miembro_proyecto_proyecto_id = p_proyecto_id
        AND mp.miembro_proyecto_usuario_id = auth.uid()
        AND mp.miembro_proyecto_rol IN ('LIDER', 'CO_LIDER')
    );
$$;

-- Chequeo estricto (solo el LIDER original) para las acciones que el
-- CO_LIDER no debe poder realizar: eliminar el proyecto y, en las RPC de
-- administrar_miembros.sql, gestionar miembros/roles.
CREATE OR REPLACE FUNCTION public.es_lider_principal_proyecto(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.miembroproyecto AS mp
      WHERE mp.miembro_proyecto_proyecto_id = p_proyecto_id
        AND mp.miembro_proyecto_usuario_id = auth.uid()
        AND mp.miembro_proyecto_rol = 'LIDER'
    );
$$;

REVOKE ALL
ON FUNCTION public.es_lider_principal_proyecto(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.es_lider_principal_proyecto(uuid)
TO authenticated;

-- La eliminacion del proyecto sigue exclusiva del LIDER original (antes
-- coincidia con es_lider_proyecto solo porque ademas exige que el proyecto
-- no tenga otros miembros; se endurece explicitamente para no depender de
-- esa coincidencia).
CREATE OR REPLACE FUNCTION public.puede_eliminar_proyecto(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.es_lider_principal_proyecto(p_proyecto_id)
    AND (
      SELECT count(*) = 1
      FROM public.miembroproyecto AS mp
      WHERE mp.miembro_proyecto_proyecto_id = p_proyecto_id
    );
$$;

-- Permite asignar el nuevo rol con sus permisos asociados.
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
    OR (v_rol_nuevo = 'CO_LIDER' AND v_permisos_nuevos = 'TOTAL')
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

  -- La gestion de miembros/roles (incluido nombrar o quitar CO_LIDER) sigue
  -- exclusiva del LIDER original, nunca de un CO_LIDER.
  IF NOT EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_usuario_id = auth.uid()
      AND lider.miembro_proyecto_rol = 'LIDER'
  ) THEN
    RAISE EXCEPTION 'Solo el lider puede administrar miembros';
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

  -- Solo el LIDER original puede expulsar miembros (incluidos CO_LIDER).
  IF NOT EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS lider
    WHERE lider.miembro_proyecto_proyecto_id = v_proyecto_id
      AND lider.miembro_proyecto_usuario_id = auth.uid()
      AND lider.miembro_proyecto_rol = 'LIDER'
  ) THEN
    RAISE EXCEPTION 'Solo el lider puede administrar miembros';
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

-- Incluye al CO_LIDER en el segundo lugar del orden del listado de equipo.
CREATE OR REPLACE FUNCTION public.obtener_miembros_proyecto(p_proyecto_id uuid)
RETURNS TABLE (
  miembro_proyecto_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  usuario_correo text,
  miembro_rol text,
  miembro_permisos text,
  miembro_fecha_ingreso timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    miembro.miembro_proyecto_id,
    usuario.usuario_id,
    usuario.usuario_nombre,
    usuario.usuario_correo,
    miembro.miembro_proyecto_rol,
    miembro.miembro_proyecto_permisos,
    miembro.miembro_proyecto_fechaingreso
  FROM public.miembroproyecto AS miembro
  JOIN public.usuario AS usuario
    ON usuario.usuario_id = miembro.miembro_proyecto_usuario_id
  WHERE public.es_miembro_proyecto(p_proyecto_id)
    AND miembro.miembro_proyecto_proyecto_id = p_proyecto_id
  ORDER BY
    CASE miembro.miembro_proyecto_rol
      WHEN 'LIDER' THEN 0
      WHEN 'CO_LIDER' THEN 1
      ELSE 2
    END,
    lower(usuario.usuario_nombre);
$$;
