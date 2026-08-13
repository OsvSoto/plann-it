import { useState } from 'react'

import { crearTablero as crearTableroService } from '../services/proyecto.service'

export function useCrearTablero() {
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function actualizarNombre(valor: string) {
    setNombre(valor)

    if (error) {
      setError(null)
    }
  }

  function reiniciar() {
    setNombre('')
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
      await crearTableroService({
        proyectoId,
        nombre: nombreLimpio,
      })
      reiniciar()
      return true
    } catch (error) {
      console.error('Error al crear tablero:', error)
      setError('No fue posible crear el tablero. Intenta nuevamente.')
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
