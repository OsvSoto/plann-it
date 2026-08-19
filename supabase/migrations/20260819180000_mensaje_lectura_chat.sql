-- Registra por usuario/proyecto la fecha del ultimo mensaje leido en el chat,
-- para poder marcar con un indicador de "no leido" los chats con mensajes nuevos.

CREATE TABLE public.mensaje_lectura (
  mensaje_lectura_usuario_id   uuid                     NOT NULL,
  mensaje_lectura_proyecto_id  uuid                     NOT NULL,
  mensaje_lectura_ultima_fecha timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.mensaje_lectura
  ADD CONSTRAINT mensaje_lectura_pkey PRIMARY KEY (mensaje_lectura_usuario_id, mensaje_lectura_proyecto_id);

ALTER TABLE public.mensaje_lectura
  ADD CONSTRAINT mensaje_lectura_usuario_id_fkey FOREIGN KEY (mensaje_lectura_usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.mensaje_lectura
  ADD CONSTRAINT mensaje_lectura_proyecto_id_fkey FOREIGN KEY (mensaje_lectura_proyecto_id) REFERENCES public.proyecto(proyecto_id) ON DELETE CASCADE;

ALTER TABLE public.mensaje_lectura ENABLE ROW LEVEL SECURITY;

CREATE POLICY mensaje_lectura_propia ON public.mensaje_lectura
  FOR ALL
  USING (mensaje_lectura_usuario_id = auth.uid())
  WITH CHECK (mensaje_lectura_usuario_id = auth.uid());

GRANT ALL ON public.mensaje_lectura TO authenticated;
GRANT ALL ON public.mensaje_lectura TO service_role;

-- Devuelve, para cada proyecto del usuario autenticado, si tiene mensajes
-- de chat sin leer (enviados por otra persona despues de su ultima lectura).
CREATE OR REPLACE FUNCTION public.obtener_no_leidos_chat()
RETURNS TABLE(proyecto_id uuid, no_leido boolean)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT
    mp.miembro_proyecto_proyecto_id AS proyecto_id,
    COALESCE(
      (
        SELECT max(m.mensaje_fecha_envio)
        FROM public.mensaje m
        WHERE m.mensaje_proyecto_id = mp.miembro_proyecto_proyecto_id
          AND m.mensaje_usuario_id IS DISTINCT FROM auth.uid()
      ) > COALESCE(ml.mensaje_lectura_ultima_fecha, '-infinity'::timestamptz),
      false
    ) AS no_leido
  FROM public.miembroproyecto mp
  LEFT JOIN public.mensaje_lectura ml
    ON ml.mensaje_lectura_proyecto_id = mp.miembro_proyecto_proyecto_id
   AND ml.mensaje_lectura_usuario_id = auth.uid()
  WHERE mp.miembro_proyecto_usuario_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.obtener_no_leidos_chat() TO authenticated;

-- Marca como leido el chat de un proyecto para el usuario autenticado.
CREATE OR REPLACE FUNCTION public.marcar_chat_leido(p_proyecto_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
AS $$
  INSERT INTO public.mensaje_lectura (mensaje_lectura_usuario_id, mensaje_lectura_proyecto_id, mensaje_lectura_ultima_fecha)
  VALUES (auth.uid(), p_proyecto_id, now())
  ON CONFLICT (mensaje_lectura_usuario_id, mensaje_lectura_proyecto_id)
  DO UPDATE SET mensaje_lectura_ultima_fecha = now();
$$;

GRANT EXECUTE ON FUNCTION public.marcar_chat_leido(uuid) TO authenticated;
