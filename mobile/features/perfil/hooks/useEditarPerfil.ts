import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import {
  actualizarPerfil,
  obtenerPerfil,
} from '../services/perfil.service'

import type { FotoPerfilSeleccionada } from '../types'

const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024

export function useEditarPerfil() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [biografia, setBiografia] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [fotoSeleccionada, setFotoSeleccionada] =
    useState<FotoPerfilSeleccionada | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarPerfil() {
      try {
        setCargando(true)
        setError(null)
        const perfil = await obtenerPerfil()
        setNombre(perfil.nombre)
        setCorreo(perfil.correo)
        setBiografia(perfil.biografia)
        setFotoUrl(perfil.fotoUrl)
      } catch (error) {
        console.error('Error al cargar el perfil para editar:', error)
        setError('No fue posible cargar tu perfil.')
      } finally {
        setCargando(false)
      }
    }

    void cargarPerfil()
  }, [])

  async function seleccionarFoto(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permiso.granted) {
        throw new Error(
          'Necesitamos permiso para acceder a tus fotos.'
        )
      }
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    })

    if (resultado.canceled) {
      return false
    }

    const foto = resultado.assets[0]

    if (foto.fileSize && foto.fileSize > TAMANO_MAXIMO_FOTO) {
      throw new Error('La foto debe pesar menos de 5 MB.')
    }

    if (!foto.base64) {
      throw new Error('No fue posible procesar la foto seleccionada.')
    }

    setFotoSeleccionada({
      uri: foto.uri,
      base64: foto.base64,
      mimeType: foto.mimeType ?? 'image/jpeg',
    })

    return true
  }

  async function guardarPerfil() {
    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      throw new Error('El nombre de usuario es obligatorio.')
    }

    try {
      setGuardando(true)
      setError(null)
      return await actualizarPerfil({
        nombre: nombreLimpio,
        biografia,
        foto: fotoSeleccionada,
      })
    } catch (error) {
      console.error('Error al guardar el perfil:', error)
      setError('No fue posible guardar los cambios.')
      throw error
    } finally {
      setGuardando(false)
    }
  }

  return {
    nombre,
    setNombre,
    correo,
    biografia,
    setBiografia,
    fotoUri: fotoSeleccionada?.uri ?? fotoUrl,
    cargando,
    guardando,
    error,
    seleccionarFoto,
    guardarPerfil,
  }
}
