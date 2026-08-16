-- Las eliminaciones de proyecto, lista y tarea son definitivas. Las filas
-- dependientes se eliminan en la misma transacción mediante claves foráneas.

ALTER TABLE public.analisis_ia
  DROP CONSTRAINT analisis_ia_proyecto_id_fkey,
  ADD CONSTRAINT analisis_ia_proyecto_id_fkey
    FOREIGN KEY (analisis_ia_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;

DO $$
BEGIN
  IF to_regclass('public.cartagantt') IS NOT NULL THEN
    ALTER TABLE public.cartagantt
      DROP CONSTRAINT cartagantt_proyecto_id_fkey,
      ADD CONSTRAINT cartagantt_proyecto_id_fkey
        FOREIGN KEY (carta_gantt_proyecto_id)
        REFERENCES public.proyecto(proyecto_id)
        ON DELETE CASCADE;
  END IF;
END;
$$;

ALTER TABLE public.chat
  DROP CONSTRAINT chat_proyecto_id_fkey,
  ADD CONSTRAINT chat_proyecto_id_fkey
    FOREIGN KEY (chat_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;

ALTER TABLE public.invitacionproyecto
  DROP CONSTRAINT invitacionproyecto_proyecto_id_fkey,
  ADD CONSTRAINT invitacionproyecto_proyecto_id_fkey
    FOREIGN KEY (invitacion_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;

ALTER TABLE public.miembroproyecto
  DROP CONSTRAINT miembroproyecto_proyecto_id_fkey,
  ADD CONSTRAINT miembroproyecto_proyecto_id_fkey
    FOREIGN KEY (miembro_proyecto_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;

ALTER TABLE public.tablero
  DROP CONSTRAINT tablero_proyecto_id_fkey,
  ADD CONSTRAINT tablero_proyecto_id_fkey
    FOREIGN KEY (tablero_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;

ALTER TABLE public.lista
  DROP CONSTRAINT lista_tablero_id_fkey,
  ADD CONSTRAINT lista_tablero_id_fkey
    FOREIGN KEY (lista_tablero_id)
    REFERENCES public.tablero(tablero_id)
    ON DELETE CASCADE;

ALTER TABLE public.tarea
  DROP CONSTRAINT tarea_lista_id_fkey,
  ADD CONSTRAINT tarea_lista_id_fkey
    FOREIGN KEY (tarea_lista_id)
    REFERENCES public.lista(lista_id)
    ON DELETE CASCADE;

ALTER TABLE public.actividad
  DROP CONSTRAINT actividad_tarea_id_fkey,
  ADD CONSTRAINT actividad_tarea_id_fkey
    FOREIGN KEY (actividad_tarea_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

ALTER TABLE public.asignaciontarea
  DROP CONSTRAINT asignaciontarea_miembro_id_fkey,
  ADD CONSTRAINT asignaciontarea_miembro_id_fkey
    FOREIGN KEY (asignacion_tarea_miembro_id)
    REFERENCES public.miembroproyecto(miembro_proyecto_id)
    ON DELETE CASCADE,
  DROP CONSTRAINT asignaciontarea_tarea_id_fkey,
  ADD CONSTRAINT asignaciontarea_tarea_id_fkey
    FOREIGN KEY (asignacion_tarea_tarea_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

ALTER TABLE public.etiquetatarea
  DROP CONSTRAINT etiquetatarea_tarea_id_fkey,
  ADD CONSTRAINT etiquetatarea_tarea_id_fkey
    FOREIGN KEY (etiqueta_tarea_tarea_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

DO $$
BEGIN
  IF to_regclass('public.itemgantt') IS NOT NULL THEN
    ALTER TABLE public.itemgantt
      DROP CONSTRAINT itemgantt_item_gantt_carta_gantt_id_fkey,
      ADD CONSTRAINT itemgantt_item_gantt_carta_gantt_id_fkey
        FOREIGN KEY (item_gantt_carta_gantt_id)
        REFERENCES public.cartagantt(carta_gantt_id)
        ON DELETE CASCADE,
      DROP CONSTRAINT itemgantt_tarea_id_fkey,
      ADD CONSTRAINT itemgantt_tarea_id_fkey
        FOREIGN KEY (item_gantt_tarea_id)
        REFERENCES public.tarea(tarea_id)
        ON DELETE CASCADE;
  END IF;
END;
$$;

ALTER TABLE public.mensaje
  DROP CONSTRAINT mensaje_chat_id_fkey,
  ADD CONSTRAINT mensaje_chat_id_fkey
    FOREIGN KEY (mensaje_chat_id)
    REFERENCES public.chat(chat_id)
    ON DELETE CASCADE;

ALTER TABLE public.mensajearchivo
  DROP CONSTRAINT mensajearchivo_mensaje_id_fkey,
  ADD CONSTRAINT mensajearchivo_mensaje_id_fkey
    FOREIGN KEY (mensaje_archivo_mensaje_id)
    REFERENCES public.mensaje(mensaje_id)
    ON DELETE CASCADE;

ALTER TABLE public.tareaarchivo
  DROP CONSTRAINT tareaarchivo_tarea_id_fkey,
  ADD CONSTRAINT tareaarchivo_tarea_id_fkey
    FOREIGN KEY (tarea_archivo_tarea_id)
    REFERENCES public.tarea(tarea_id)
    ON DELETE CASCADE;

-- Un miembro puede eliminar cualquier tarea de un proyecto al que pertenece.
DROP POLICY IF EXISTS "Lideres pueden eliminar tareas" ON public.tarea;

CREATE POLICY "Miembros pueden eliminar tareas"
ON public.tarea
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND public.es_miembro_proyecto(t.tablero_proyecto_id)
  )
);

-- El proyecto solo puede eliminarse si el usuario es líder y no existen otros
-- miembros. Se expone también para que la interfaz pueda explicar el bloqueo.
CREATE OR REPLACE FUNCTION public.puede_eliminar_proyecto(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.es_lider_proyecto(p_proyecto_id)
    AND (
      SELECT count(*) = 1
      FROM public.miembroproyecto AS mp
      WHERE mp.miembro_proyecto_proyecto_id = p_proyecto_id
    );
$$;

REVOKE ALL
ON FUNCTION public.puede_eliminar_proyecto(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.puede_eliminar_proyecto(uuid)
TO authenticated;

CREATE POLICY "Lider unico puede eliminar proyecto"
ON public.proyecto
FOR DELETE
TO authenticated
USING (public.puede_eliminar_proyecto(proyecto_id));
