-- Restricciones de permisos en tareas: usuario no puede editar/eliminar tareas ajenas.
--
-- Editar: permitido si es LIDER, está asignado como responsable activo de la tarea,
-- o la tarea no tiene ningún responsable activo asignado (neutral/colaborativa).
--
-- Eliminar: en una Carta Gantt colaborativa, borrar una actividad afecta el cronograma
-- compartido y es difícil de revertir, así que se restringe a quien la creó (por si se
-- equivocó) o al LIDER del proyecto. Los miembros asignados pueden editar pero no borrar.

ALTER TABLE public.tarea
  ADD COLUMN IF NOT EXISTS tarea_creado_por uuid DEFAULT auth.uid();

ALTER TABLE public.tarea
  ADD CONSTRAINT tarea_creado_por_fkey
    FOREIGN KEY (tarea_creado_por)
    REFERENCES public.usuario(usuario_id)
    ON DELETE SET NULL;

DROP POLICY IF EXISTS "Miembros pueden actualizar tareas" ON public.tarea;
DROP POLICY IF EXISTS "Miembros pueden eliminar tareas" ON public.tarea;
DROP POLICY IF EXISTS "Lideres pueden eliminar tareas" ON public.tarea;

CREATE POLICY "Miembros pueden actualizar tareas"
ON public.tarea
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND (
        -- 1. Es líder del proyecto
        public.es_lider_proyecto(t.tablero_proyecto_id)
        -- 2. Está asignado a esta tarea
        OR EXISTS (
          SELECT 1
          FROM public.asignaciontarea AS ast
          JOIN public.miembroproyecto AS mp ON mp.miembro_proyecto_id = ast.asignacion_tarea_miembro_id
          WHERE ast.asignacion_tarea_tarea_id = tarea_id
            AND ast.asignacion_tarea_active = true
            AND mp.miembro_proyecto_usuario_id = auth.uid()
        )
        -- 3. La tarea no tiene ningún responsable asignado activo
        OR NOT EXISTS (
          SELECT 1
          FROM public.asignaciontarea AS ast
          WHERE ast.asignacion_tarea_active = true
            AND ast.asignacion_tarea_tarea_id = tarea_id
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND (
        public.es_lider_proyecto(t.tablero_proyecto_id)
        OR EXISTS (
          SELECT 1
          FROM public.asignaciontarea AS ast
          JOIN public.miembroproyecto AS mp ON mp.miembro_proyecto_id = ast.asignacion_tarea_miembro_id
          WHERE ast.asignacion_tarea_tarea_id = tarea_id
            AND ast.asignacion_tarea_active = true
            AND mp.miembro_proyecto_usuario_id = auth.uid()
        )
        OR NOT EXISTS (
          SELECT 1
          FROM public.asignaciontarea AS ast
          WHERE ast.asignacion_tarea_active = true
            AND ast.asignacion_tarea_tarea_id = tarea_id
        )
      )
  )
);

CREATE POLICY "Lideres y creadores pueden eliminar tareas"
ON public.tarea
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND (
        -- 1. Es líder del proyecto
        public.es_lider_proyecto(t.tablero_proyecto_id)
        -- 2. Es quien creó la tarea
        OR tarea_creado_por = auth.uid()
      )
  )
);
