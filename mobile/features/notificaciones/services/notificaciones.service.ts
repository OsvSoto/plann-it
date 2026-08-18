import { supabase } from '../../../lib/supabase'

export async function registrarPushToken(token: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('push_token')
    .upsert(
      {
        push_token_usuario_id: userData.user.id,
        push_token_token: token,
      },
      { onConflict: 'push_token_usuario_id,push_token_token' }
    )

  if (error) throw error
}

export async function eliminarPushToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('push_token')
    .delete()
    .eq('push_token_token', token)

  if (error) throw error
}

export async function eliminarMisPushTokens(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return

  const { error } = await supabase
    .from('push_token')
    .delete()
    .eq('push_token_usuario_id', userData.user.id)

  if (error) throw error
}
