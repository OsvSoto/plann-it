import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'

import { obtenerPerfil } from '../services/perfil.service'

import type { PerfilUsuario } from '../types'

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPerfil = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      setPerfil(await obtenerPerfil())
    } catch (error) {
      console.error('Error al cargar el perfil:', error)
      setError('No fue posible cargar tu perfil.')
    } finally {
      setCargando(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void cargarPerfil()
    }, [cargarPerfil])
  )

  return {
    perfil,
    cargando,
    error,
    cargarPerfil,
  }
}
