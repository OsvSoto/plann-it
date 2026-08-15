-- Flujo seguro de invitaciones y membresias de proyecto.

UPDATE public.invitacionproyecto
SET invitacion_estado = upper(trim(invitacion_estado));

ALTER TABLE public.invitacionproyecto
  ALTER COLUMN invitacion_estado SET DEFAULT 'PENDIENTE';

-- Conserva el historial, pero solo la invitacion mas reciente puede quedar
-- pendiente cuando existen duplicados anteriores a esta migracion.
WITH invitaciones_duplicadas AS (
  SELECT
    invitacion_id,
    row_number() OVER (
      PARTITION BY invitacion_usuario_id, invitacion_proyecto_id
      ORDER BY invitacion_fecha DESC, invitacion_id DESC
    ) AS posicion
  FROM public.invitacionproyecto
  WHERE invitacion_estado = 'PENDIENTE'
)
UPDATE public.invitacionproyecto AS invitacion
SET invitacion_estado = 'RECHAZADA'
FROM invitaciones_duplicadas AS duplicada
WHERE invitacion.invitacion_id = duplicada.invitacion_id
  AND duplicada.posicion > 1;

ALTER TABLE public.invitacionproyecto
  DROP CONSTRAINT IF EXISTS invitacion_estado_valido,
  ADD CONSTRAINT invitacion_estado_valido
    CHECK (invitacion_estado IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA'));

CREATE UNIQUE INDEX IF NOT EXISTS invitacion_pendiente_unica_idx
ON public.invitacionproyecto (
  invitacion_usuario_id,
  invitacion_proyecto_id
)
WHERE invitacion_estado = 'PENDIENTE';

CREATE INDEX IF NOT EXISTS invitacion_usuario_estado_idx
ON public.invitacionproyecto (
  invitacion_usuario_id,
  invitacion_estado,
  invitacion_fecha DESC
);

CREATE INDEX IF NOT EXISTS usuario_correo_normalizado_idx
ON public.usuario (lower(usuario_correo));

DROP POLICY IF EXISTS "Destinatarios pueden ver sus invitaciones"
ON public.invitacionproyecto;

CREATE POLICY "Destinatarios pueden ver sus invitaciones"
ON public.invitacionproyecto
FOR SELECT
TO authenticated
USING (invitacion_usuario_id = auth.uid());

DROP POLICY IF EXISTS "Lideres pueden ver invitaciones del proyecto"
ON public.invitacionproyecto;

CREATE POLICY "Lideres pueden ver invitaciones del proyecto"
ON public.invitacionproyecto
FOR SELECT
TO authenticated
USING (public.es_lider_proyecto(invitacion_proyecto_id));

CREATE OR REPLACE FUNCTION public.invitar_usuario_proyecto(
  p_proyecto_id uuid,
  p_correo text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_usuario_actual uuid := auth.uid();
  v_usuario_invitado uuid;
  v_invitacion_id uuid;
BEGIN
  IF v_usuario_actual IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF NOT public.es_lider_proyecto(p_proyecto_id) THEN
    RAISE EXCEPTION 'Solo el lider del proyecto puede enviar invitaciones';
  END IF;

  SELECT usuario.usuario_id
  INTO v_usuario_invitado
  FROM public.usuario AS usuario
  WHERE lower(usuario.usuario_correo) = lower(trim(p_correo))
  LIMIT 1;

  IF v_usuario_invitado IS NULL THEN
    RAISE EXCEPTION 'No existe un usuario registrado con ese correo';
  END IF;

  IF v_usuario_invitado = v_usuario_actual THEN
    RAISE EXCEPTION 'No puedes invitarte a tu propio proyecto';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.miembroproyecto AS miembro
    WHERE miembro.miembro_proyecto_usuario_id = v_usuario_invitado
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
    v_usuario_invitado,
    p_proyecto_id,
    'PENDIENTE'
  )
  RETURNING invitacion_id INTO v_invitacion_id;

  RETURN v_invitacion_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Ya existe una invitacion pendiente para ese usuario';
END;
$$;

CREATE OR REPLACE FUNCTION public.responder_invitacion(
  p_invitacion_id uuid,
  p_respuesta text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_usuario_actual uuid := auth.uid();
  v_proyecto_id uuid;
  v_estado_actual text;
  v_respuesta text := upper(trim(p_respuesta));
BEGIN
  IF v_usuario_actual IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF v_respuesta IS NULL
    OR v_respuesta NOT IN ('ACEPTADA', 'RECHAZADA') THEN
    RAISE EXCEPTION 'La respuesta debe ser ACEPTADA o RECHAZADA';
  END IF;

  SELECT
    invitacion.invitacion_proyecto_id,
    invitacion.invitacion_estado
  INTO
    v_proyecto_id,
    v_estado_actual
  FROM public.invitacionproyecto AS invitacion
  WHERE invitacion.invitacion_id = p_invitacion_id
    AND invitacion.invitacion_usuario_id = v_usuario_actual
  FOR UPDATE;

  IF v_proyecto_id IS NULL THEN
    RAISE EXCEPTION 'La invitacion no existe o no pertenece al usuario';
  END IF;

  IF v_estado_actual <> 'PENDIENTE' THEN
    RAISE EXCEPTION 'La invitacion ya fue respondida';
  END IF;

  IF v_respuesta = 'ACEPTADA' THEN
    INSERT INTO public.miembroproyecto (
      miembro_proyecto_usuario_id,
      miembro_proyecto_proyecto_id,
      miembro_proyecto_rol,
      miembro_proyecto_permisos
    )
    VALUES (
      v_usuario_actual,
      v_proyecto_id,
      'MIEMBRO',
      'COLABORAR'
    )
    ON CONFLICT (
      miembro_proyecto_usuario_id,
      miembro_proyecto_proyecto_id
    ) DO NOTHING;
  END IF;

  UPDATE public.invitacionproyecto
  SET invitacion_estado = v_respuesta
  WHERE invitacion_id = p_invitacion_id;

  RETURN v_proyecto_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_invitaciones_pendientes()
RETURNS TABLE (
  invitacion_id uuid,
  invitacion_fecha timestamp with time zone,
  proyecto_id uuid,
  proyecto_nombre text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    invitacion.invitacion_id,
    invitacion.invitacion_fecha,
    proyecto.proyecto_id,
    proyecto.proyecto_nombre
  FROM public.invitacionproyecto AS invitacion
  JOIN public.proyecto AS proyecto
    ON proyecto.proyecto_id = invitacion.invitacion_proyecto_id
  WHERE auth.uid() IS NOT NULL
    AND invitacion.invitacion_usuario_id = auth.uid()
    AND invitacion.invitacion_estado = 'PENDIENTE'
  ORDER BY invitacion.invitacion_fecha DESC;
$$;

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
    CASE WHEN miembro.miembro_proyecto_rol = 'LIDER' THEN 0 ELSE 1 END,
    lower(usuario.usuario_nombre);
$$;

REVOKE ALL
ON FUNCTION public.invitar_usuario_proyecto(uuid, text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.responder_invitacion(uuid, text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.obtener_invitaciones_pendientes()
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.obtener_miembros_proyecto(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.invitar_usuario_proyecto(uuid, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.responder_invitacion(uuid, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.obtener_invitaciones_pendientes()
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.obtener_miembros_proyecto(uuid)
TO authenticated;
