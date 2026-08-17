-- La migracion anterior (20260817110000) redefinio
-- buscar_usuarios_para_invitacion con el orden de parametros
-- (p_proyecto_id uuid, p_busqueda text), distinto al original
-- (p_busqueda text, p_proyecto_id uuid). Como la identidad de una
-- funcion en Postgres depende de los tipos de argumento en orden,
-- CREATE OR REPLACE no reemplazo la funcion vieja: creo un segundo
-- overload y dejo viva la version insegura original (sin chequeo de
-- lider, otorgada a anon). Se elimina explicitamente ese overload.

DROP FUNCTION IF EXISTS public.buscar_usuarios_para_invitacion(text, uuid);
