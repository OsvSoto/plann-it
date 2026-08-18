import { useEffect, useState } from 'react'

import {
  crearTablero as crearTableroService,
  editarTablero as editarTableroService,
} from '../services/proyecto.service'

import type { TableroDetalle } from '../types'

export function useFormularioTablero(tablero?: TableroDetalle | null) {
  const [nombre, setNombre] = useState(tablero?.tablero_nombre ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setNombre(tablero?.tablero_nombre ?? '')
    setError(null)
  }, [tablero])

  function actualizarNombre(valor: string) {
    setNombre(valor)

    if (error) {
      setError(null)
    }
  }

  function reiniciar() {
    setNombre(tablero?.tablero_nombre ?? '')
    setError(null)
  }

  async function guardar(proyectoId: string) {
    if (guardando) {
      return false
    }

    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      setError('Ingresa un nombre para el tablero.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)

      if (tablero) {
        await editarTableroService({
          tableroId: tablero.tablero_id,
          nombre: nombreLimpio,
        })
      } else {
        await crearTableroService({
          proyectoId,
          nombre: nombreLimpio,
        })
      }

      reiniciar()
      return true
    } catch (error) {
      console.error('Error al guardar tablero:', error)
      setError('No fue posible guardar el tablero. Intenta nuevamente.')
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    nombre,
    guardando,
    error,
    actualizarNombre,
    reiniciar,
    guardar,
  }
}
