export type RespuestaInvitacion = 'ACEPTADA' | 'RECHAZADA'

export type InvitacionPendiente = {
  invitacion_id: string
  invitacion_fecha: string
  proyecto_id: string
  proyecto_nombre: string
}

export type MiembroProyecto = {
  miembro_proyecto_id: string
  usuario_id: string
  usuario_nombre: string
  usuario_correo: string
  miembro_rol: string
  miembro_permisos: string
  miembro_fecha_ingreso: string
}
