export type PerfilUsuario = {
  usuarioId: string
  nombre: string
  correo: string
  biografia: string
  fotoUrl: string | null
}

export type FotoPerfilSeleccionada = {
  uri: string
  base64: string
  mimeType: string
}

export type ActualizarPerfilInput = {
  nombre: string
  biografia: string
  foto: FotoPerfilSeleccionada | null
}
