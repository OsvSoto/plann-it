import { useState } from 'react'
import { buscarUsuariosParaInvitacion, enviarInvitacionUsuario } from '../services/invitacion.service'
import type { UsuarioBusqueda } from '../types'
import { obtenerMensajeError } from './errorInvitacion'

export function useInvitarMiembro(proyectoId: string) {
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultados, setResultados] = useState<UsuarioBusqueda[]>([])
  const [error, setError] = useState<string | null>(null)

  async function buscar(texto: string) {
    const query = texto.trim()
    if (query.length < 2) {
      setResultados([])
      return
    }
    try {
      setBuscando(true)
      setError(null)
      const data = await buscarUsuariosParaInvitacion(proyectoId, query)
      setResultados(data)
    } catch (err) {
      console.error('Error al buscar usuarios:', err)
      setError(obtenerMensajeError(err, 'No fue posible realizar la búsqueda.'))
    } finally {
      setBuscando(false)
    }
  }

  async function invitar(usuarioId: string) {
    if (enviando) return false
    try {
      setEnviando(true)
      setError(null)
      await enviarInvitacionUsuario(proyectoId, usuarioId)
      return true
    } catch (err) {
      console.error('Error al enviar invitación:', err)
      setError(obtenerMensajeError(err, 'No fue posible enviar la invitación.'))
      return false
    } finally {
      setEnviando(false)
    }
  }

  return {
    buscando,
    enviando,
    resultados,
    error,
    setResultados,
    limpiarError: () => setError(null),
    buscar,
    invitar,
  }
}