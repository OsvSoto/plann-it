import { useState } from 'react'

import {
  actualizarMiembroProyecto,
  eliminarMiembroProyecto,
} from '../services/invitacion.service'
import { obtenerMensajeError } from './errorInvitacion'

import type { ActualizarMiembroInput } from '../types'

export function useAdministrarMiembro() {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ejecutar(accion: () => Promise<void>) {
    if (procesando) {
      return false
    }

    try {
      setProcesando(true)
      setError(null)
      await accion()
      return true
    } catch (error) {
      console.error('Error al administrar miembro:', error)
      setError(obtenerMensajeError(
        error,
        'No fue posible actualizar el equipo.'
      ))
      return false
    } finally {
      setProcesando(false)
    }
  }

  function actualizar(miembro: ActualizarMiembroInput) {
    return ejecutar(() => actualizarMiembroProyecto(miembro))
  }

  function eliminar(miembroId: string) {
    return ejecutar(() => eliminarMiembroProyecto(miembroId))
  }

  return {
    procesando,
    error,
    limpiarError: () => setError(null),
    actualizar,
    eliminar,
  }
}
