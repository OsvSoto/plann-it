import { supabase } from '../../../lib/supabase'

export async function obtenerAnalisisAnteriores(proyectoId: string) {
  const { data, error } = await supabase
    .from('analisis_ia')
    .select('*')
    .eq('analisis_ia_proyecto_id', proyectoId)
    .order('analisis_ia_fechageneracion', { ascending: false })

  if (error) throw error
  return data || []
}

export async function generarYGuardarAnalisis(proyectoId: string) {
  const { data: resumen, error: rpcError } = await supabase
    .rpc('obtener_resumen_proyecto_ia', { p_proyecto_id: proyectoId })

  if (rpcError) throw rpcError

  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Falta la API Key de Groq en las variables de entorno.')
  }

  const prompt = `Eres un experto Gestor de Proyectos (Project Manager). 
Evalúa el estado actual de este proyecto, revisa si las fechas tienen sentido, si hay cuellos de botella por tareas no asignadas o atrasadas, la participación del equipo, e identifica puntos críticos o mejoras.

REGLA OBLIGATORIA: La PRIMERA LÍNEA de tu respuesta debe ser ÚNICAMENTE una síntesis del estado del proyecto en MÁXIMO 6 PALABRAS. No uses asteriscos ni negritas en esta primera línea. 
A partir de la segunda línea, desarrolla tu análisis completo utilizando formato Markdown (títulos, negritas, listas, etc.) con un tono profesional.

DATOS DEL PROYECTO (En formato JSON):
${JSON.stringify(resumen, null, 2)}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: 'You are a helpful project manager assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
    }),
  })

  if (!res.ok) {
    const errorDetail = await res.text()
    console.error('Detalle del error de Groq:', errorDetail)
    throw new Error(`Error de Groq: ${res.status} - ${errorDetail}`)
  }

  const jsonRes = await res.json()
  const analisisResultado = jsonRes.choices[0].message.content

  const { error: insertError } = await supabase
    .from('analisis_ia')
    .insert({
      analisis_ia_proyecto_id: proyectoId,
      analisis_ia_resultado: analisisResultado
    })

  if (insertError) throw insertError

  return analisisResultado
}