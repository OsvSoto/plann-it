import { supabase } from '../../../lib/supabase'

import type {
  ActualizarPerfilInput,
  FotoPerfilSeleccionada,
  PerfilUsuario,
} from '../types'

const AVATARES_BUCKET = 'avatares'

async function obtenerUsuarioAutenticado() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('No hay una sesión activa.')
  }

  return user
}

function decodificarBase64(base64: string): ArrayBuffer {
  const contenidoBinario = globalThis.atob(base64)
  const bytes = new Uint8Array(contenidoBinario.length)

  for (let indice = 0; indice < contenidoBinario.length; indice += 1) {
    bytes[indice] = contenidoBinario.charCodeAt(indice)
  }

  return bytes.buffer
}

async function subirFotoPerfil(
  usuarioId: string,
  foto: FotoPerfilSeleccionada
): Promise<string> {
  const ruta = `${usuarioId}/perfil`
  const { error } = await supabase.storage
    .from(AVATARES_BUCKET)
    .upload(ruta, decodificarBase64(foto.base64), {
      contentType: foto.mimeType,
      upsert: true,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from(AVATARES_BUCKET)
    .getPublicUrl(ruta)

  return `${data.publicUrl}?v=${Date.now()}`
}

export async function obtenerPerfil(): Promise<PerfilUsuario> {
  const user = await obtenerUsuarioAutenticado()
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      usuario_id,
      usuario_nombre,
      usuario_correo,
      usuario_bio,
      usuario_foto
    `)
    .eq('usuario_id', user.id)
    .single()

  if (error) {
    throw error
  }

  return {
    usuarioId: data.usuario_id,
    nombre: data.usuario_nombre,
    correo: data.usuario_correo || user.email || '',
    biografia: data.usuario_bio ?? '',
    fotoUrl: data.usuario_foto,
  }
}

export async function actualizarPerfil(
  perfil: ActualizarPerfilInput
): Promise<PerfilUsuario> {
  const user = await obtenerUsuarioAutenticado()
  const fotoUrl = perfil.foto
    ? await subirFotoPerfil(user.id, perfil.foto)
    : undefined

  const cambios = {
    usuario_nombre: perfil.nombre.trim(),
    usuario_bio: perfil.biografia.trim() || null,
    ...(fotoUrl ? { usuario_foto: fotoUrl } : {}),
  }

  const { data, error } = await supabase
    .from('usuario')
    .update(cambios)
    .eq('usuario_id', user.id)
    .select(`
      usuario_id,
      usuario_nombre,
      usuario_correo,
      usuario_bio,
      usuario_foto
    `)
    .single()

  if (error) {
    throw error
  }

  return {
    usuarioId: data.usuario_id,
    nombre: data.usuario_nombre,
    correo: data.usuario_correo || user.email || '',
    biografia: data.usuario_bio ?? '',
    fotoUrl: data.usuario_foto,
  }
}
