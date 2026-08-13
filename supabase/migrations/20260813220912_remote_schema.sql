-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE FUNCTION public.crear_proyecto (
  p_nombre      text,
  p_descripcion text,
  p_fecha_fin   date
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuario_id uuid;
  v_proyecto_id uuid;
begin
  v_usuario_id := auth.uid();

  if v_usuario_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  insert into public.proyecto (
    proyecto_nombre,
    proyecto_descripcion,
    proyecto_fecha_inicio,
    proyecto_fecha_fin,
    proyecto_estado
  )
  values (
    p_nombre,
    p_descripcion,
    current_date,
    p_fecha_fin,
    'ACTIVO'
  )
  returning proyecto_id
  into v_proyecto_id;

  insert into public.miembroproyecto (
    miembro_proyecto_usuario_id,
    miembro_proyecto_proyecto_id,
    miembro_proyecto_rol,
    miembro_proyecto_permisos
  )
  values (
    v_usuario_id,
    v_proyecto_id,
    'LIDER',
    'TOTAL'
  );

  return v_proyecto_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.crear_proyecto(text, text, date) FROM PUBLIC;

GRANT ALL ON FUNCTION public.crear_proyecto(text, text, date) TO anon;

GRANT ALL ON FUNCTION public.crear_proyecto(text, text, date) TO authenticated;

GRANT ALL ON FUNCTION public.crear_proyecto(text, text, date) TO service_role;

CREATE FUNCTION public.crear_usuario_publico()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.usuario (
    usuario_id,
    usuario_nombre,
    usuario_correo
  )
  values (
    new.id,

    coalesce(
      nullif(new.raw_user_meta_data ->> 'usuario_nombre', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),

    new.email
  )
  on conflict (usuario_id)
  do update set
    usuario_nombre = excluded.usuario_nombre,
    usuario_correo = excluded.usuario_correo;

  return new;
end;
$function$;

CREATE TRIGGER al_crear_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_usuario_publico();

GRANT ALL ON FUNCTION public.crear_usuario_publico() TO anon;

GRANT ALL ON FUNCTION public.crear_usuario_publico() TO authenticated;

GRANT ALL ON FUNCTION public.crear_usuario_publico() TO service_role;

CREATE FUNCTION public.manejar_nuevo_usuario()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
    nombre_final text;
    correo_final text;
BEGIN
    nombre_final := new.raw_user_meta_data->>'full_name';
    
    IF nombre_final IS NULL OR nombre_final = '' THEN
        nombre_final := split_part(new.email, '@', 1);
    END IF;
    
    IF nombre_final IS NULL OR nombre_final = '' THEN
        nombre_final := 'Usuario Nuevo';
    END IF;

    correo_final := new.email;
    
    IF correo_final IS NULL OR correo_final = '' THEN
        correo_final := 'sin_correo@ejemplo.com';
    END IF;

    INSERT INTO public.Usuario (usuario_id, usuario_nombre, usuario_correo)
    VALUES (new.id, nombre_final, correo_final);
    
    RETURN new;
END;
$function$;

CREATE TRIGGER al_crear_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.manejar_nuevo_usuario();

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO anon;

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO authenticated;

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO service_role;

CREATE TABLE public.actividad (
  actividad_id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  actividad_usuario_id uuid                     NOT NULL,
  actividad_tarea_id   uuid                     NOT NULL,
  actividad_desc       text                     NOT NULL,
  actividad_tipo       text                     NOT NULL,
  actividad_fecha      timestamp with time zone NOT NULL
);

ALTER TABLE public.actividad
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.actividad
  ADD CONSTRAINT actividad_pkey PRIMARY KEY (actividad_id);

GRANT ALL ON public.actividad TO anon;

GRANT ALL ON public.actividad TO authenticated;

GRANT ALL ON public.actividad TO service_role;

CREATE TABLE public.analisis_ia (
  analisis_ia_id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  analisis_ia_proyecto_id     uuid                     NOT NULL,
  analisis_ia_fechageneracion timestamp with time zone DEFAULT now() NOT NULL,
  analisis_ia_resultado       text                     NOT NULL
);

ALTER TABLE public.analisis_ia
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.analisis_ia
  ADD CONSTRAINT analisis_ia_pkey PRIMARY KEY (analisis_ia_id);

GRANT ALL ON public.analisis_ia TO anon;

GRANT ALL ON public.analisis_ia TO authenticated;

GRANT ALL ON public.analisis_ia TO service_role;

CREATE TABLE public.archivo (
  archivo_id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  archivo_nombre       text                     NOT NULL,
  archivo_url          text                     NOT NULL,
  archivo_tipo         text                     NOT NULL,
  archivo_fecha_subida timestamp with time zone NOT NULL,
  archivo_tamano       integer                  NOT NULL
);

ALTER TABLE public.archivo
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.archivo
  ADD CONSTRAINT archivo_pkey PRIMARY KEY (archivo_id);

GRANT ALL ON public.archivo TO anon;

GRANT ALL ON public.archivo TO authenticated;

GRANT ALL ON public.archivo TO service_role;

CREATE TABLE public.asignaciontarea (
  asignacion_tarea_id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  asignacion_tarea_miembro_id uuid                     NOT NULL,
  asignacion_tarea_tarea_id   uuid                     NOT NULL,
  asignacion_tarea_inicio     timestamp with time zone DEFAULT now() NOT NULL,
  asignacion_tarea_fin        timestamp with time zone NOT NULL,
  asignacion_tarea_active     boolean                  DEFAULT true NOT NULL
);

ALTER TABLE public.asignaciontarea
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.asignaciontarea
  ADD CONSTRAINT asignaciontarea_pkey PRIMARY KEY (asignacion_tarea_id);

GRANT ALL ON public.asignaciontarea TO anon;

GRANT ALL ON public.asignaciontarea TO authenticated;

GRANT ALL ON public.asignaciontarea TO service_role;

CREATE TABLE public.cartagantt (
  carta_gantt_id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  carta_gantt_proyecto_id  uuid                     NOT NULL,
  carta_gantt_fecha_inicio timestamp with time zone NOT NULL,
  carta_gantt_fecha_fin    timestamp with time zone NOT NULL
);

ALTER TABLE public.cartagantt
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cartagantt
  ADD CONSTRAINT cartagantt_pkey PRIMARY KEY (carta_gantt_id);

GRANT ALL ON public.cartagantt TO anon;

GRANT ALL ON public.cartagantt TO authenticated;

GRANT ALL ON public.cartagantt TO service_role;

CREATE TABLE public.chat (
  chat_id          uuid DEFAULT gen_random_uuid() NOT NULL,
  chat_proyecto_id uuid NOT NULL
);

ALTER TABLE public.chat
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat
  ADD CONSTRAINT chat_pkey PRIMARY KEY (chat_id);

GRANT ALL ON public.chat TO anon;

GRANT ALL ON public.chat TO authenticated;

GRANT ALL ON public.chat TO service_role;

CREATE TABLE public.etiqueta (
  etiqueta_id     uuid DEFAULT gen_random_uuid() NOT NULL,
  etiqueta_nombre text NOT NULL,
  etiqueta_color  text NOT NULL
);

ALTER TABLE public.etiqueta
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.etiqueta
  ADD CONSTRAINT etiqueta_pkey PRIMARY KEY (etiqueta_id);

GRANT ALL ON public.etiqueta TO anon;

GRANT ALL ON public.etiqueta TO authenticated;

GRANT ALL ON public.etiqueta TO service_role;

CREATE TABLE public.etiquetatarea (
  etiqueta_tarea_id          uuid DEFAULT gen_random_uuid() NOT NULL,
  etiqueta_tarea_tarea_id    uuid NOT NULL,
  etiqueta_tarea_etiqueta_id uuid NOT NULL
);

ALTER TABLE public.etiquetatarea
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.etiquetatarea
  ADD CONSTRAINT etiquetatarea_etiqueta_id_fkey FOREIGN KEY (etiqueta_tarea_etiqueta_id) REFERENCES public.etiqueta(etiqueta_id);

ALTER TABLE public.etiquetatarea
  ADD CONSTRAINT etiquetatarea_pkey PRIMARY KEY (etiqueta_tarea_id);

GRANT ALL ON public.etiquetatarea TO anon;

GRANT ALL ON public.etiquetatarea TO authenticated;

GRANT ALL ON public.etiquetatarea TO service_role;

CREATE TABLE public.invitacionproyecto (
  invitacion_id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  invitacion_usuario_id  uuid                     NOT NULL,
  invitacion_proyecto_id uuid                     NOT NULL,
  invitacion_fecha       timestamp with time zone DEFAULT now() NOT NULL,
  invitacion_estado      text                     DEFAULT 'Pendiente'::text NOT NULL
);

ALTER TABLE public.invitacionproyecto
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invitacionproyecto
  ADD CONSTRAINT invitacionproyecto_pkey PRIMARY KEY (invitacion_id);

GRANT ALL ON public.invitacionproyecto TO anon;

GRANT ALL ON public.invitacionproyecto TO authenticated;

GRANT ALL ON public.invitacionproyecto TO service_role;

CREATE TABLE public.itemgantt (
  item_gantt_id             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  item_gantt_tarea_id       uuid                     NOT NULL,
  item_gantt_fecha_inicio   timestamp with time zone NOT NULL,
  item_gantt_fecha_fin      timestamp with time zone NOT NULL,
  item_gantt_progreso       integer                  NOT NULL,
  item_gantt_posicion       integer                  NOT NULL,
  item_gantt_carta_gantt_id uuid
);

ALTER TABLE public.itemgantt
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.itemgantt
  ADD CONSTRAINT itemgantt_item_gantt_carta_gantt_id_fkey FOREIGN KEY (item_gantt_carta_gantt_id) REFERENCES public.cartagantt(carta_gantt_id);

ALTER TABLE public.itemgantt
  ADD CONSTRAINT itemgantt_pkey PRIMARY KEY (item_gantt_id);

GRANT ALL ON public.itemgantt TO anon;

GRANT ALL ON public.itemgantt TO authenticated;

GRANT ALL ON public.itemgantt TO service_role;

CREATE TABLE public.lista (
  lista_id         uuid    DEFAULT gen_random_uuid() NOT NULL,
  lista_tablero_id uuid    NOT NULL,
  lista_nombre     text    NOT NULL,
  lista_orden      integer NOT NULL
);

ALTER TABLE public.lista
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lista
  ADD CONSTRAINT lista_pkey PRIMARY KEY (lista_id);

GRANT ALL ON public.lista TO anon;

GRANT ALL ON public.lista TO authenticated;

GRANT ALL ON public.lista TO service_role;

CREATE TABLE public.mensaje (
  mensaje_id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  mensaje_chat_id     uuid                     NOT NULL,
  mensaje_texto       text                     NOT NULL,
  mensaje_fecha_envio timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.mensaje
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mensaje
  ADD CONSTRAINT mensaje_chat_id_fkey FOREIGN KEY (mensaje_chat_id) REFERENCES public.chat(chat_id);

ALTER TABLE public.mensaje
  ADD CONSTRAINT mensaje_pkey PRIMARY KEY (mensaje_id);

GRANT ALL ON public.mensaje TO anon;

GRANT ALL ON public.mensaje TO authenticated;

GRANT ALL ON public.mensaje TO service_role;

CREATE TABLE public.mensajearchivo (
  id                         uuid DEFAULT gen_random_uuid() NOT NULL,
  mensaje_archivo_archivo_id uuid NOT NULL,
  mensaje_archivo_mensaje_id uuid NOT NULL
);

ALTER TABLE public.mensajearchivo
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mensajearchivo
  ADD CONSTRAINT mensajearchivo_archivo_id_fkey FOREIGN KEY (mensaje_archivo_archivo_id) REFERENCES public.archivo(archivo_id);

ALTER TABLE public.mensajearchivo
  ADD CONSTRAINT mensajearchivo_mensaje_id_fkey FOREIGN KEY (mensaje_archivo_mensaje_id) REFERENCES public.mensaje(mensaje_id);

ALTER TABLE public.mensajearchivo
  ADD CONSTRAINT mensajearchivo_pkey PRIMARY KEY (id);

GRANT ALL ON public.mensajearchivo TO anon;

GRANT ALL ON public.mensajearchivo TO authenticated;

GRANT ALL ON public.mensajearchivo TO service_role;

CREATE TABLE public.miembroproyecto (
  miembro_proyecto_id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  miembro_proyecto_usuario_id   uuid                     NOT NULL,
  miembro_proyecto_proyecto_id  uuid                     NOT NULL,
  miembro_proyecto_rol          text                     NOT NULL,
  miembro_proyecto_permisos     text                     NOT NULL,
  miembro_proyecto_fechaingreso timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.miembroproyecto
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.miembroproyecto
  ADD CONSTRAINT miembroproyecto_pkey PRIMARY KEY (miembro_proyecto_id);

ALTER TABLE public.asignaciontarea
  ADD CONSTRAINT asignaciontarea_miembro_id_fkey FOREIGN KEY (asignacion_tarea_miembro_id) REFERENCES public.miembroproyecto(miembro_proyecto_id);

ALTER TABLE public.miembroproyecto
  ADD CONSTRAINT miembroproyecto_usuario_proyecto_unique UNIQUE (miembro_proyecto_usuario_id, miembro_proyecto_proyecto_id);

GRANT ALL ON public.miembroproyecto TO anon;

GRANT ALL ON public.miembroproyecto TO authenticated;

GRANT ALL ON public.miembroproyecto TO service_role;

CREATE POLICY "Usuarios pueden ver sus membresias" ON public.miembroproyecto
  FOR SELECT
  TO authenticated
  USING ((miembro_proyecto_usuario_id = ( SELECT auth.uid() AS uid)));

CREATE TABLE public.notificacion (
  notificacion_id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  notificacion_usuario_id uuid                     NOT NULL,
  notificacion_alerta     text                     NOT NULL,
  notificacion_fecha      timestamp with time zone DEFAULT now() NOT NULL,
  notificacion_tipo       text                     NOT NULL,
  notificacion_leida      boolean                  DEFAULT false NOT NULL
);

ALTER TABLE public.notificacion
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notificacion
  ADD CONSTRAINT notificacion_pkey PRIMARY KEY (notificacion_id);

GRANT ALL ON public.notificacion TO anon;

GRANT ALL ON public.notificacion TO authenticated;

GRANT ALL ON public.notificacion TO service_role;

CREATE TABLE public.proyecto (
  proyecto_id           uuid DEFAULT gen_random_uuid() NOT NULL,
  proyecto_nombre       text NOT NULL,
  proyecto_descripcion  text,
  proyecto_fecha_inicio date DEFAULT CURRENT_DATE NOT NULL,
  proyecto_fecha_fin    date NOT NULL,
  proyecto_estado       text NOT NULL
);

ALTER TABLE public.proyecto
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proyecto
  ADD CONSTRAINT proyecto_pkey PRIMARY KEY (proyecto_id);

ALTER TABLE public.analisis_ia
  ADD CONSTRAINT analisis_ia_proyecto_id_fkey FOREIGN KEY (analisis_ia_proyecto_id) REFERENCES public.proyecto(proyecto_id);

ALTER TABLE public.cartagantt
  ADD CONSTRAINT cartagantt_proyecto_id_fkey FOREIGN KEY (carta_gantt_proyecto_id) REFERENCES public.proyecto(proyecto_id);

ALTER TABLE public.chat
  ADD CONSTRAINT chat_proyecto_id_fkey FOREIGN KEY (chat_proyecto_id) REFERENCES public.proyecto(proyecto_id);

ALTER TABLE public.invitacionproyecto
  ADD CONSTRAINT invitacionproyecto_proyecto_id_fkey FOREIGN KEY (invitacion_proyecto_id) REFERENCES public.proyecto(proyecto_id);

ALTER TABLE public.miembroproyecto
  ADD CONSTRAINT miembroproyecto_proyecto_id_fkey FOREIGN KEY (miembro_proyecto_proyecto_id) REFERENCES public.proyecto(proyecto_id);

GRANT ALL ON public.proyecto TO anon;

GRANT ALL ON public.proyecto TO authenticated;

GRANT ALL ON public.proyecto TO service_role;

CREATE POLICY "Miembros pueden ver sus proyectos" ON public.proyecto
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.miembroproyecto mp
  WHERE ((mp.miembro_proyecto_proyecto_id = proyecto.proyecto_id) AND (mp.miembro_proyecto_usuario_id = ( SELECT auth.uid() AS uid))))));

CREATE TABLE public.tablero (
  tablero_id          uuid DEFAULT gen_random_uuid() NOT NULL,
  tablero_proyecto_id uuid NOT NULL,
  tablero_nombre      text NOT NULL
);

ALTER TABLE public.tablero
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tablero
  ADD CONSTRAINT tablero_pkey PRIMARY KEY (tablero_id);

ALTER TABLE public.lista
  ADD CONSTRAINT lista_tablero_id_fkey FOREIGN KEY (lista_tablero_id) REFERENCES public.tablero(tablero_id);

ALTER TABLE public.tablero
  ADD CONSTRAINT tablero_proyecto_id_fkey FOREIGN KEY (tablero_proyecto_id) REFERENCES public.proyecto(proyecto_id);

GRANT ALL ON public.tablero TO anon;

GRANT ALL ON public.tablero TO authenticated;

GRANT ALL ON public.tablero TO service_role;

CREATE TABLE public.tarea (
  tarea_id            uuid DEFAULT gen_random_uuid() NOT NULL,
  tarea_lista_id      uuid NOT NULL,
  tarea_nombre        text NOT NULL,
  tarea_desc          text,
  tarea_estado        text NOT NULL,
  tarea_fecha_entrega date NOT NULL
);

ALTER TABLE public.tarea
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tarea
  ADD CONSTRAINT tarea_lista_id_fkey FOREIGN KEY (tarea_lista_id) REFERENCES public.lista(lista_id);

ALTER TABLE public.tarea
  ADD CONSTRAINT tarea_pkey PRIMARY KEY (tarea_id);

ALTER TABLE public.actividad
  ADD CONSTRAINT actividad_tarea_id_fkey FOREIGN KEY (actividad_tarea_id) REFERENCES public.tarea(tarea_id);

ALTER TABLE public.asignaciontarea
  ADD CONSTRAINT asignaciontarea_tarea_id_fkey FOREIGN KEY (asignacion_tarea_tarea_id) REFERENCES public.tarea(tarea_id);

ALTER TABLE public.etiquetatarea
  ADD CONSTRAINT etiquetatarea_tarea_id_fkey FOREIGN KEY (etiqueta_tarea_tarea_id) REFERENCES public.tarea(tarea_id);

ALTER TABLE public.itemgantt
  ADD CONSTRAINT itemgantt_tarea_id_fkey FOREIGN KEY (item_gantt_tarea_id) REFERENCES public.tarea(tarea_id);

GRANT ALL ON public.tarea TO anon;

GRANT ALL ON public.tarea TO authenticated;

GRANT ALL ON public.tarea TO service_role;

CREATE TABLE public.tareaarchivo (
  id                       uuid DEFAULT gen_random_uuid() NOT NULL,
  tarea_archivo_archivo_id uuid NOT NULL,
  tarea_archivo_tarea_id   uuid NOT NULL
);

ALTER TABLE public.tareaarchivo
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tareaarchivo
  ADD CONSTRAINT tareaarchivo_archivo_id_fkey FOREIGN KEY (tarea_archivo_archivo_id) REFERENCES public.archivo(archivo_id);

ALTER TABLE public.tareaarchivo
  ADD CONSTRAINT tareaarchivo_pkey PRIMARY KEY (id);

ALTER TABLE public.tareaarchivo
  ADD CONSTRAINT tareaarchivo_tarea_id_fkey FOREIGN KEY (tarea_archivo_tarea_id) REFERENCES public.tarea(tarea_id);

GRANT ALL ON public.tareaarchivo TO anon;

GRANT ALL ON public.tareaarchivo TO authenticated;

GRANT ALL ON public.tareaarchivo TO service_role;

CREATE TABLE public.usuario (
  usuario_id            uuid                     NOT NULL,
  usuario_nombre        text                     NOT NULL,
  usuario_correo        text                     NOT NULL,
  usuario_fecharegistro timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.usuario
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usuario
  ADD CONSTRAINT usuario_pkey PRIMARY KEY (usuario_id);

ALTER TABLE public.actividad
  ADD CONSTRAINT actividad_usuario_id_fkey FOREIGN KEY (actividad_usuario_id) REFERENCES public.usuario(usuario_id);

ALTER TABLE public.invitacionproyecto
  ADD CONSTRAINT invitacionproyecto_usuario_id_fkey FOREIGN KEY (invitacion_usuario_id) REFERENCES public.usuario(usuario_id);

ALTER TABLE public.miembroproyecto
  ADD CONSTRAINT miembroproyecto_usuario_id_fkey FOREIGN KEY (miembro_proyecto_usuario_id) REFERENCES public.usuario(usuario_id);

ALTER TABLE public.notificacion
  ADD CONSTRAINT notificacion_usuario_id_fkey FOREIGN KEY (notificacion_usuario_id) REFERENCES public.usuario(usuario_id);

ALTER TABLE public.usuario
  ADD CONSTRAINT usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.usuario TO anon;

GRANT ALL ON public.usuario TO authenticated;

GRANT ALL ON public.usuario TO service_role;

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.usuario
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = usuario_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = usuario_id));

CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.usuario
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = usuario_id));
