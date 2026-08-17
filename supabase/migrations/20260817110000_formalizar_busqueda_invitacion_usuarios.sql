-- Formaliza dos funciones que se habian creado directamente en la base
-- remota (fuera del flujo de migraciones) para el buscador de usuarios y
-- el envio de invitaciones por id. Ambas carecian de control de permisos
-- y estaban otorgadas a "anon", permitiendo a cualquiera (incluso sin
-- sesion) enumerar usuarios de la app e invitar a cualquier proyecto.
--
-- Logica correcta:
--   - Cualquier usuario autenticado puede buscar a otro usuario y ver su
--     perfil publico basico (buscar_usuarios).
--   - Solo el LIDER del proyecto puede buscar usuarios con fines de
--     invitacion (excluye miembros/invitados) y enviarles la invitacion
--     (buscar_usuarios_para_invitacion, enviar_invitacion_usuario).

-- 1. Busqueda general de usuarios (ver perfil), abierta a cualquier
--    autenticado. No filtra por proyecto ni requiere ser lider.
CREATE OR REPLACE FUNCTION public.buscar_usuarios(
  p_busqueda text
) RETURNS TABLE (
  usuario_id uuid,
  usuario_nombre text,
  usuario_correo text,
  usuario_foto text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF p_busqueda LIKE '%@%.%' THEN
    RETURN QUERY
    SELECT u.usuario_id, u.usuario_nombre, u.usuario_correo, u.usuario_foto
    FROM public.usuario u
    WHERE u.usuario_correo ILIKE '%' || p_busqueda || '%'
      AND u.usuario_id <> auth.uid()
    LIMIT 15;
  ELSE
    RETURN QUERY
    SELECT u.usuario_id, u.usuario_nombre, u.usuario_correo, u.usuario_foto
    FROM public.usuario u
    WHERE u.usuario_nombre ILIKE '%' || p_busqueda || '%'
      AND u.usuario_id <> auth.uid()
    LIMIT 15;
  END IF;
END;
$$;

-- 2. Busqueda de usuarios para invitar a un proyecto: exclusiva del lider.
CREATE OR REPLACE FUNCTION public.buscar_usuarios_para_invitacion(
  p_proyecto_id uuid,
  p_busqueda text
) RETURNS TABLE (
  usuario_id uuid,
  usuario_nombre text,
  usuario_correo text,
  usuario_foto text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NOT public.es_lider_proyecto(p_proyecto_id) THEN
    RAISE EXCEPTION 'Solo el lider del proyecto puede buscar usuarios para invitar';
  END IF;

  IF p_busqueda LIKE '%@%.%' THEN
    RETURN QUERY
    SELECT u.usuario_id, u.usuario_nombre, u.usuario_correo, u.usuario_foto
    FROM public.usuario u
    WHERE u.usuario_correo ILIKE '%' || p_busqueda || '%'
      AND NOT EXISTS (SELECT 1 FROM public.miembroproyecto mp WHERE mp.miembro_proyecto_usuario_id = u.usuario_id AND mp.miembro_proyecto_proyecto_id = p_proyecto_id)
      AND NOT EXISTS (SELECT 1 FROM public.invitacionproyecto ip WHERE ip.invitacion_usuario_id = u.usuario_id AND ip.invitacion_proyecto_id = p_proyecto_id AND ip.invitacion_estado = 'PENDIENTE')
    LIMIT 15;
  ELSE
    RETURN QUERY
    SELECT u.usuario_id, u.usuario_nombre, u.usuario_correo, u.usuario_foto
    FROM public.usuario u
    WHERE u.usuario_nombre ILIKE '%' || p_busqueda || '%'
      AND NOT EXISTS (SELECT 1 FROM public.miembroproyecto mp WHERE mp.miembro_proyecto_usuario_id = u.usuario_id AND mp.miembro_proyecto_proyecto_id = p_proyecto_id)
      AND NOT EXISTS (SELECT 1 FROM public.invitacionproyecto ip WHERE ip.invitacion_usuario_id = u.usuario_id AND ip.invitacion_proyecto_id = p_proyecto_id AND ip.invitacion_estado = 'PENDIENTE')
    LIMIT 15;
  END IF;
END;
$$;

-- 3. Envio de invitacion por id de usuario (resultado del buscador),
--    con las mismas validaciones que invitar_usuario_proyecto (por correo).
CREATE OR REPLACE FUNCTION public.enviar_invitacion_usuario(
  p_proyecto_id uuid,
  p_usuario_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_usuario_actual uuid := auth.uid();
  v_inv_id uuid;
BEGIN
  IF v_usuario_actual IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF NOT public.es_lider_proyecto(p_proyecto_id) THEN
    RAISE EXCEPTION 'Solo el lider del proyecto puede enviar invitaciones';
  END IF;

  IF p_usuario_id = v_usuario_actual THEN
    RAISE EXCEPTION 'No puedes invitarte a tu propio proyecto';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.usuario WHERE usuario_id = p_usuario_id) THEN
    RAISE EXCEPTION 'El usuario no existe';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS miembro
    WHERE miembro.miembro_proyecto_usuario_id = p_usuario_id
      AND miembro.miembro_proyecto_proyecto_id = p_proyecto_id
  ) THEN
    RAISE EXCEPTION 'El usuario ya pertenece al proyecto';
  END IF;

  INSERT INTO public.invitacionproyecto (
    invitacion_usuario_id,
    invitacion_proyecto_id,
    invitacion_estado
  )
  VALUES (
    p_usuario_id,
    p_proyecto_id,
    'PENDIENTE'
  )
  RETURNING invitacion_id INTO v_inv_id;

  RETURN v_inv_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Ya existe una invitacion pendiente para ese usuario';
END;
$$;

-- Permisos: solo autenticados (nunca anon), igual que el resto de RPCs.
REVOKE ALL ON FUNCTION public.buscar_usuarios(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_usuarios(text) TO authenticated;

REVOKE ALL ON FUNCTION public.buscar_usuarios_para_invitacion(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_usuarios_para_invitacion(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.enviar_invitacion_usuario(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enviar_invitacion_usuario(uuid, uuid) TO authenticated;
