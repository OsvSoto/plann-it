import { useEffect, useState } from 'react'

import {
  crearLista as crearListaService,
  editarLista as editarListaService,
} from '../services/proyecto.service'

import type { ListaDetalle } from '../types'

export function useFormularioLista(lista?: ListaDetalle | null) {
  const [nombre, setNombre] = useState(lista?.lista_nombre ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setNombre(lista?.lista_nombre ?? '')
    setError(null)
  }, [lista])

  function actualizarNombre(valor: string) {
    setNombre(valor)
    setError(null)
  }

  function reiniciar() {
    setNombre(lista?.lista_nombre ?? '')
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

      if (lista) {
        await editarListaService({
          listaId: lista.lista_id,
          nombre: nombreLimpio,
        })
      } else {
        await crearListaService({
          tableroId,
          nombre: nombreLimpio,
          orden,
        })
      }

      reiniciar()
      return true
    } catch (error) {
      console.error('Error al guardar lista:', error)
      setError('No fue posible guardar la lista. Intenta nuevamente.')
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
