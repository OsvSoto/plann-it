import { supabase } from '../../../lib/supabase'

import type {
  InvitacionPendiente,
  MiembroProyecto,
  RespuestaInvitacion,
} from '../types'

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

  return data ?? []
}
