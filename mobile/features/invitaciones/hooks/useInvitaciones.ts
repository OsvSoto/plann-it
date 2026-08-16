import { useCallback, useState } from 'react'

import {
  obtenerInvitacionesPendientes,
  responderInvitacion,
} from '../services/invitacion.service'
import { obtenerMensajeError } from './errorInvitacion'

import type {
  InvitacionPendiente,
  RespuestaInvitacion,
} from '../types'

export function useInvitaciones() {
  const [invitaciones, setInvitaciones] = useState<InvitacionPendiente[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cargarInvitaciones = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      setInvitaciones(await obtenerInvitacionesPendientes())
    } catch (error) {
      console.error('Error al cargar invitaciones:', error)
      setError('No fue posible cargar las invitaciones.')
    } finally {
      setCargando(false)
    }
  }, [])

  async function responder(
    invitacionId: string,
    respuesta: RespuestaInvitacion
  ) {
    if (procesando) {
      return null
    }

    try {
      setProcesando(invitacionId)
      setError(null)
      const proyectoId = await responderInvitacion(invitacionId, respuesta)
      setInvitaciones((actuales) =>
        actuales.filter((invitacion) => invitacion.invitacion_id !== invitacionId)
      )
      return proyectoId
    } catch (error) {
      console.error('Error al responder invitacion:', error)
      setError(obtenerMensajeError(
        error,
        'No fue posible responder la invitacion.'
      ))
      return null
    } finally {
      setProcesando(null)
    }
  }

  return {
    invitaciones,
    cargando,
    procesando,
    error,
    cargarInvitaciones,
    responder,
  }
}
