create or replace function public.editar_proyecto(
  p_proyecto_id uuid,
  p_nombre text,
  p_descripcion text,
  p_fecha_fin date,
  p_estado text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if not exists (
    select 1
    from public.miembroproyecto mp
    where mp.miembro_proyecto_proyecto_id = p_proyecto_id
      and mp.miembro_proyecto_usuario_id = auth.uid()
      and mp.miembro_proyecto_rol = 'LIDER'
  ) then
    raise exception 'No tienes permisos para editar este proyecto';
  end if;

  if trim(p_nombre) = '' then
    raise exception 'El nombre no puede estar vacío';
  end if;

  if p_estado not in (
    'ACTIVO',
    'PAUSADO',
    'COMPLETADO',
    'ARCHIVADO'
  ) then
    raise exception 'Estado inválido';
  end if;

  update public.proyecto
  set
    proyecto_nombre = trim(p_nombre),
    proyecto_descripcion = nullif(trim(p_descripcion), ''),
    proyecto_fecha_fin = p_fecha_fin,
    proyecto_estado = p_estado
  where proyecto_id = p_proyecto_id;

  if not found then
    raise exception 'Proyecto no encontrado';
  end if;
end;
$$;

revoke all
on function public.editar_proyecto(
  uuid,
  text,
  text,
  date,
  text
)
from public;

grant execute
on function public.editar_proyecto(
  uuid,
  text,
  text,
  date,
  text
)
to authenticated;