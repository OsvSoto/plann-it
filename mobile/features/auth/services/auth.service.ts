import { supabase } from '../../../lib/supabase'
import { eliminarMisPushTokens } from '../../notificaciones/services/notificaciones.service'

export async function cerrarSesion(): Promise<void> {
  await eliminarMisPushTokens().catch((error) => {
    console.error('Error al eliminar push tokens:', error)
  })

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
