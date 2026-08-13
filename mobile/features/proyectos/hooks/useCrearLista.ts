import { useState } from 'react'

import { crearLista as crearListaService } from '../services/proyecto.service'

export function useCrearLista() {
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function actualizarNombre(valor: string) {
    setNombre(valor)
    setError(null)
  }

  function reiniciar() {
    setNombre('')
    setError(null)
  }

  async function guardar(tableroId: string, orden: number) {
    if (guardando) {
      return false
    }

    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      setError('Ingresa un nombre para la lista.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)
      await crearListaService({
        tableroId,
        nombre: nombreLimpio,
        orden,
      })
      reiniciar()
      return true
    } catch (error) {
      console.error('Error al crear lista:', error)
      setError('No fue posible crear la lista. Intenta nuevamente.')
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
