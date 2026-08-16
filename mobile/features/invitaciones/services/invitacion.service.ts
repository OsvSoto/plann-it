import { supabase } from '../../../lib/supabase'

import type {
  ActualizarMiembroInput,
  InvitacionPendiente,
  MiembroProyecto,
  RespuestaInvitacion,
} from '../types'

export async function actualizarMiembroProyecto(
  miembro: ActualizarMiembroInput
): Promise<void> {
  const { error } = await supabase.rpc('actualizar_miembro_proyecto', {
    p_miembro_id: miembro.miembroId,
    p_rol: miembro.rol,
    p_permisos: miembro.permisos,
  })

  if (error) {
    throw error
  }
}

export async function eliminarMiembroProyecto(
  miembroId: string
): Promise<void> {
  const { error } = await supabase.rpc('eliminar_miembro_proyecto', {
    p_miembro_id: miembroId,
  })

  if (error) {
    throw error
  }
}

export async function obtenerInvitacionesPendientes(): Promise<InvitacionPendiente[]> {
  const { data, error } = await supabase.rpc(
    'obtener_invitaciones_pendientes',
    {}
  )

  if (error) {
    throw error
  }

  return data ?? []
}

export async function invitarUsuarioProyecto(
  proyectoId: string,
  correo: string
): Promise<string> {
  const { data, error } = await supabase.rpc(
    'invitar_usuario_proyecto',
    {
      p_proyecto_id: proyectoId,
      p_correo: correo.trim(),
    }
  )

  if (error) {
    throw error
  }

  if (typeof data !== 'string') {
    throw new Error('La invitacion no devolvio un identificador')
  }

  return data
}

export async function responderInvitacion(
  invitacionId: string,
  respuesta: RespuestaInvitacion
): Promise<string> {
  const { data, error } = await supabase.rpc(
    'responder_invitacion',
    {
      p_invitacion_id: invitacionId,
      p_respuesta: respuesta,
    }
  )

  if (error) {
    throw error
  }

  if (typeof data !== 'string') {
    throw new Error('La respuesta no devolvio el proyecto asociado')
  }

  return data
}

export async function obtenerMiembrosProyecto(
  proyectoId: string
): Promise<MiembroProyecto[]> {
  const { data, error } = await supabase.rpc(
    'obtener_miembros_proyecto',
    { p_proyecto_id: proyectoId }
  )

  if (error) {
    throw error
  }

  return (data ?? []).map((miembro) => {
    const rol = miembro.miembro_rol
    const permisos = miembro.miembro_permisos

    if (
      rol !== 'LIDER'
      && rol !== 'MIEMBRO'
    ) {
      throw new Error('El proyecto contiene un rol de miembro desconocido')
    }

    if (
      permisos !== 'TOTAL'
      && permisos !== 'COLABORAR'
    ) {
      throw new Error('El proyecto contiene permisos de miembro desconocidos')
    }

    return {
      ...miembro,
      miembro_rol: rol,
      miembro_permisos: permisos,
    }
  })
}

export async function obtenerUsuarioActualId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('No hay una sesión activa')
  }

  return data.user.id
}
