export type RespuestaInvitacion = 'ACEPTADA' | 'RECHAZADA'
export type RolMiembro = 'LIDER' | 'MIEMBRO'
export type PermisosMiembro = 'TOTAL' | 'COLABORAR'

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
  miembro_rol: RolMiembro
  miembro_permisos: PermisosMiembro
  miembro_fecha_ingreso: string
}

export type ActualizarMiembroInput = {
  miembroId: string
  rol: RolMiembro
  permisos: PermisosMiembro
}

export type UsuarioBusqueda = {
  usuario_id: string
  usuario_nombre: string
  usuario_correo: string
  usuario_foto: string | null
}