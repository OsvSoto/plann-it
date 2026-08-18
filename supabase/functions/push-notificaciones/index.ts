import { createClient } from 'jsr:@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, any>
}

type ExpoMessage = {
  to: string
  title: string
  body: string
  data: Record<string, any>
}

Deno.serve(async (req) => {
  const secretEsperado = Deno.env.get('WEBHOOK_SECRET')
  const secretRecibido = req.headers.get('x-webhook-secret')
  if (!secretEsperado || secretRecibido !== secretEsperado) {
    return new Response('No autorizado', { status: 401 })
  }

  const payload: WebhookPayload = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let destinatarios: string[] = []
  let titulo = ''
  let cuerpo = ''
  let data: Record<string, any> = {}

  if (payload.table === 'mensaje' && payload.type === 'INSERT') {
    const record = payload.record
    const proyectoId = record.mensaje_proyecto_id
    const emisorId = record.mensaje_usuario_id

    const { data: miembros, error: miembrosError } = await supabase
      .from('miembroproyecto')
      .select('miembro_proyecto_usuario_id')
      .eq('miembro_proyecto_proyecto_id', proyectoId)
      .neq('miembro_proyecto_usuario_id', emisorId)

    if (miembrosError) {
      return new Response(JSON.stringify({ error: miembrosError.message }), { status: 500 })
    }

    destinatarios = (miembros ?? []).map((m) => m.miembro_proyecto_usuario_id)

    let nombreEmisor = 'Alguien'
    if (emisorId) {
      const { data: usuario } = await supabase
        .from('usuario')
        .select('usuario_nombre')
        .eq('usuario_id', emisorId)
        .single()
      if (usuario?.usuario_nombre) nombreEmisor = usuario.usuario_nombre
    }

    titulo = nombreEmisor
    cuerpo = record.mensaje_texto?.trim() || 'Envio un archivo'
    data = { tipo: 'mensaje', proyectoId }
  } else if (payload.table === 'invitacionproyecto' && payload.type === 'INSERT') {
    const record = payload.record
    if (record.invitacion_estado !== 'PENDIENTE') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    destinatarios = [record.invitacion_usuario_id]
    titulo = 'Nueva invitacion'
    cuerpo = 'Te invitaron a un proyecto en Plann-It'
    data = { tipo: 'invitacion', proyectoId: record.invitacion_proyecto_id }
  } else {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }

  if (destinatarios.length === 0) {
    return new Response(JSON.stringify({ enviados: 0 }), { status: 200 })
  }

  const { data: tokens, error: tokensError } = await supabase
    .from('push_token')
    .select('push_token_token')
    .in('push_token_usuario_id', destinatarios)

  if (tokensError) {
    return new Response(JSON.stringify({ error: tokensError.message }), { status: 500 })
  }

  const mensajes: ExpoMessage[] = (tokens ?? []).map((t) => ({
    to: t.push_token_token,
    title: titulo,
    body: cuerpo,
    data,
  }))

  if (mensajes.length === 0) {
    return new Response(JSON.stringify({ enviados: 0 }), { status: 200 })
  }

  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mensajes),
  })

  const expoResult = await expoResponse.json()

  return new Response(JSON.stringify({ enviados: mensajes.length, expo: expoResult }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
