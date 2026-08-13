-- El trigger antiguo duplica la creación de public.usuario.
DROP TRIGGER IF EXISTS al_crear_usuario ON auth.users;
DROP FUNCTION IF EXISTS public.manejar_nuevo_usuario();

-- La creación de proyectos requiere una sesión autenticada.
REVOKE EXECUTE
ON FUNCTION public.crear_proyecto(text, text, date)
FROM anon;

-- Estas funciones centralizan la autorización y evitan depender de filtros
-- enviados por el cliente. SECURITY DEFINER permite consultar membresías sin
-- que la policy de miembroproyecto oculte filas necesarias para autorizar.
CREATE OR REPLACE FUNCTION public.es_miembro_proyecto(p_proyecto_id uuid)
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
    );
$$;

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
        AND mp.miembro_proyecto_rol = 'LIDER'
    );
$$;

REVOKE ALL
ON FUNCTION public.es_miembro_proyecto(uuid)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.es_lider_proyecto(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.es_miembro_proyecto(uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.es_lider_proyecto(uuid)
TO authenticated;

-- Proyecto: todos los miembros pueden verlo y solo el líder puede editarlo.
DROP POLICY IF EXISTS "Miembros pueden ver sus proyectos" ON public.proyecto;
CREATE POLICY "Miembros pueden ver sus proyectos"
ON public.proyecto
FOR SELECT
TO authenticated
USING (public.es_miembro_proyecto(proyecto_id));

CREATE POLICY "Lideres pueden actualizar sus proyectos"
ON public.proyecto
FOR UPDATE
TO authenticated
USING (public.es_lider_proyecto(proyecto_id))
WITH CHECK (public.es_lider_proyecto(proyecto_id));

-- Tablero: lectura para miembros y administración para líderes.
CREATE POLICY "Miembros pueden ver tableros"
ON public.tablero
FOR SELECT
TO authenticated
USING (public.es_miembro_proyecto(tablero_proyecto_id));

CREATE POLICY "Lideres pueden crear tableros"
ON public.tablero
FOR INSERT
TO authenticated
WITH CHECK (public.es_lider_proyecto(tablero_proyecto_id));

CREATE POLICY "Lideres pueden actualizar tableros"
ON public.tablero
FOR UPDATE
TO authenticated
USING (public.es_lider_proyecto(tablero_proyecto_id))
WITH CHECK (public.es_lider_proyecto(tablero_proyecto_id));

CREATE POLICY "Lideres pueden eliminar tableros"
ON public.tablero
FOR DELETE
TO authenticated
USING (public.es_lider_proyecto(tablero_proyecto_id));

-- Lista: el proyecto se obtiene a través de su tablero.
CREATE POLICY "Miembros pueden ver listas"
ON public.lista
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tablero AS t
    WHERE t.tablero_id = lista_tablero_id
      AND public.es_miembro_proyecto(t.tablero_proyecto_id)
  )
);

CREATE POLICY "Lideres pueden crear listas"
ON public.lista
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tablero AS t
    WHERE t.tablero_id = lista_tablero_id
      AND public.es_lider_proyecto(t.tablero_proyecto_id)
  )
);

CREATE POLICY "Lideres pueden actualizar listas"
ON public.lista
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tablero AS t
    WHERE t.tablero_id = lista_tablero_id
      AND public.es_lider_proyecto(t.tablero_proyecto_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tablero AS t
    WHERE t.tablero_id = lista_tablero_id
      AND public.es_lider_proyecto(t.tablero_proyecto_id)
  )
);

CREATE POLICY "Lideres pueden eliminar listas"
ON public.lista
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tablero AS t
    WHERE t.tablero_id = lista_tablero_id
      AND public.es_lider_proyecto(t.tablero_proyecto_id)
  )
);

-- Tarea: los miembros colaboran; solo el líder puede eliminar definitivamente.
CREATE POLICY "Miembros pueden ver tareas"
ON public.tarea
FOR SELECT
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

CREATE POLICY "Miembros pueden crear tareas"
ON public.tarea
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND public.es_miembro_proyecto(t.tablero_proyecto_id)
  )
);

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
      AND public.es_miembro_proyecto(t.tablero_proyecto_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND public.es_miembro_proyecto(t.tablero_proyecto_id)
  )
);

CREATE POLICY "Lideres pueden eliminar tareas"
ON public.tarea
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lista AS l
    JOIN public.tablero AS t ON t.tablero_id = l.lista_tablero_id
    WHERE l.lista_id = tarea_lista_id
      AND public.es_lider_proyecto(t.tablero_proyecto_id)
  )
);

-- Índices para las relaciones utilizadas por consultas y policies.
CREATE INDEX IF NOT EXISTS tablero_proyecto_idx
ON public.tablero(tablero_proyecto_id);

CREATE INDEX IF NOT EXISTS lista_tablero_idx
ON public.lista(lista_tablero_id);

CREATE INDEX IF NOT EXISTS tarea_lista_idx
ON public.tarea(tarea_lista_id);

CREATE INDEX IF NOT EXISTS miembroproyecto_proyecto_idx
ON public.miembroproyecto(miembro_proyecto_proyecto_id);

-- Reglas de integridad que ya están definidas en el dominio.
ALTER TABLE public.proyecto
ADD CONSTRAINT proyecto_fechas_validas
CHECK (proyecto_fecha_fin >= proyecto_fecha_inicio);

ALTER TABLE public.lista
ADD CONSTRAINT lista_orden_no_negativo
CHECK (lista_orden >= 0);
