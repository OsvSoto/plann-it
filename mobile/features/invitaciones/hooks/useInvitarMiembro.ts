import { useState } from 'react'

import { invitarUsuarioProyecto } from '../services/invitacion.service'
import { obtenerMensajeError } from './errorInvitacion'

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useInvitarMiembro() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function invitar(proyectoId: string, correo: string) {
    if (enviando) {
      return false
    }

    const correoLimpio = correo.trim().toLowerCase()

    if (!PATRON_CORREO.test(correoLimpio)) {
      setError('Ingresa un correo valido.')
      return false
    }

    try {
      setEnviando(true)
      setError(null)
      await invitarUsuarioProyecto(proyectoId, correoLimpio)
      return true
    } catch (error) {
      console.error('Error al enviar invitacion:', error)
      setError(obtenerMensajeError(
        error,
        'No fue posible enviar la invitacion.'
      ))
      return false
    } finally {
      setEnviando(false)
    }
  }

  return {
    enviando,
    error,
    limpiarError: () => setError(null),
    invitar,
  }
}
