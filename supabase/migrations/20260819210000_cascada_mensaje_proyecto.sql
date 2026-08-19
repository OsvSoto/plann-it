-- mensaje.mensaje_proyecto_id nunca quedo con ON DELETE CASCADE (a diferencia
-- de chat/tablero/invitacionproyecto/etc., corregidos en
-- eliminacion_segura_proyectos.sql). La columna se agrego directamente en el
-- remoto en algun momento posterior sin pasar por una migration, por lo que
-- quedo fuera de esa correccion. Sin esto, eliminar un proyecto con mensajes
-- de chat falla con "violates foreign key constraint
-- mensaje_mensaje_proyecto_id_fkey".
ALTER TABLE public.mensaje
  DROP CONSTRAINT mensaje_mensaje_proyecto_id_fkey,
  ADD CONSTRAINT mensaje_mensaje_proyecto_id_fkey
    FOREIGN KEY (mensaje_proyecto_id)
    REFERENCES public.proyecto(proyecto_id)
    ON DELETE CASCADE;
