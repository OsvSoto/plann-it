-- La carta Gantt es una vista derivada de las tareas, no una entidad persistente.
-- ItemGantt depende de CartaGantt, por lo que debe eliminarse primero.
DROP TABLE IF EXISTS public.itemgantt;
DROP TABLE IF EXISTS public.cartagantt;
