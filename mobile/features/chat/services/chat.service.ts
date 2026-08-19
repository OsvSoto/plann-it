import { supabase } from '../../../lib/supabase'

export async function obtenerProyectosChat() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('No autorizado')

  const { data, error } = await supabase
    .from('miembroproyecto')
    .select(`
      proyecto:miembro_proyecto_proyecto_id (
        proyecto_id,
        proyecto_nombre
      )
    `)
    .eq('miembro_proyecto_usuario_id', userData.user.id)

  if (error) throw error

  return (data || []).map((item: any) => ({
    proyectoId: item.proyecto.proyecto_id,
    proyectoNombre: item.proyecto.proyecto_nombre,
  }))
}

export async function obtenerMensajes(proyectoId: string) {
  const { data, error } = await supabase
    .from('mensaje')
    .select(`
      mensaje_id,
      mensaje_texto,
      mensaje_fecha_envio,
      mensaje_usuario_id,
      usuario (
        usuario_nombre
      ),
      mensajearchivo (
        archivo (
          archivo_id,
          archivo_nombre,
          archivo_url,
          archivo_tamano,
          archivo_tipo
        )
      )
    `)
    .eq('mensaje_proyecto_id', proyectoId)
    .order('mensaje_fecha_envio', { ascending: false })

  if (error) throw error
  return data || []
}

export async function obtenerNoLeidosChat(): Promise<string[]> {
  const { data, error } = await supabase.rpc('obtener_no_leidos_chat')
  if (error) throw error
  return (data || [])
    .filter((fila: { proyecto_id: string; no_leido: boolean }) => fila.no_leido)
    .map((fila: { proyecto_id: string; no_leido: boolean }) => fila.proyecto_id)
}

export async function marcarChatLeido(proyectoId: string) {
  const { error } = await supabase.rpc('marcar_chat_leido', {
    p_proyecto_id: proyectoId,
  })
  if (error) throw error
}

export type ArchivoAdjunto = {
  uri: string;
  nombreBase: string;
  extension: string;
  mimeType: string;
  tamano: number;
}

export async function enviarMensajeChat(
  proyectoId: string, 
  texto: string, 
  archivoObj?: ArchivoAdjunto | null
) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('No autorizado')

  const { data: mensajeData, error: msgError } = await supabase
    .from('mensaje')
    .insert({
      mensaje_proyecto_id: proyectoId,
      mensaje_usuario_id: userData.user.id,
      mensaje_texto: texto.trim(),
    })
    .select('mensaje_id')
    .single()

  if (msgError) throw msgError

  if (archivoObj) {
    const nombreCompleto = `${archivoObj.nombreBase}${archivoObj.extension}`
    const filePath = `${proyectoId}/${Date.now()}_${nombreCompleto.replace(/\s+/g, '_')}`

    const formData = new FormData()
    formData.append('file', {
      uri: archivoObj.uri,
      name: nombreCompleto,
      type: archivoObj.mimeType,
    } as any)

    const { error: uploadError } = await supabase.storage
      .from('archivos_chat')
      .upload(filePath, formData)

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('archivos_chat')
      .getPublicUrl(filePath)

    const { data: fileData, error: fileError } = await supabase
      .from('archivo')
      .insert({
        archivo_nombre: nombreCompleto,
        archivo_url: publicUrlData.publicUrl,
        archivo_tipo: archivoObj.mimeType,
        archivo_tamano: archivoObj.tamano,
        archivo_fecha_subida: new Date().toISOString()
      })
      .select('archivo_id')
      .single()

    if (fileError) throw fileError

    const { error: relError } = await supabase
      .from('mensajearchivo')
      .insert({
        mensaje_archivo_archivo_id: fileData.archivo_id,
        mensaje_archivo_mensaje_id: mensajeData.mensaje_id
      })

    if (relError) throw relError
  }
}