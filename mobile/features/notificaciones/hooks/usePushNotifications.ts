import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

import { useChatGlobal } from '../../chat/context/ChatContext'
import { registrarPushToken } from '../services/notificaciones.service'

type NotificacionData = {
  tipo?: 'mensaje' | 'invitacion'
  proyectoId?: string
}

export function usePushNotifications(activo: boolean) {
  const router = useRouter()
  const { proyectoActivoId } = useChatGlobal()
  const proyectoActivoIdRef = useRef(proyectoActivoId)

  useEffect(() => {
    proyectoActivoIdRef.current = proyectoActivoId
  }, [proyectoActivoId])

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notificacion) => {
        const data = notificacion.request.content.data as NotificacionData
        const esChatAbierto =
          data?.tipo === 'mensaje' && data.proyectoId === proyectoActivoIdRef.current

        return {
          shouldShowBanner: !esChatAbierto,
          shouldShowList: !esChatAbierto,
          shouldPlaySound: !esChatAbierto,
          shouldSetBadge: false,
        }
      },
    })
  }, [])

  useEffect(() => {
    if (!activo) return

    let cancelado = false

    async function registrar() {
      if (!Device.isDevice) return

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        })
      }

      const permisosActuales = await Notifications.getPermissionsAsync()
      let estado = permisosActuales.status
      if (estado !== 'granted') {
        const solicitados = await Notifications.requestPermissionsAsync()
        estado = solicitados.status
      }
      if (estado !== 'granted') return

      const projectId = Constants.expoConfig?.extra?.eas?.projectId
      if (!projectId) {
        console.warn('Falta extra.eas.projectId en app.json, no se puede obtener el push token')
        return
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
      if (cancelado) return

      try {
        await registrarPushToken(token)
      } catch (error) {
        console.error('Error al registrar push token:', error)
      }
    }

    registrar()

    const listenerRespuesta = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const data = respuesta.notification.request.content.data as NotificacionData
      if (data?.tipo === 'invitacion') {
        router.push('/(tabs)/invitaciones')
      } else if (data?.tipo === 'mensaje' && data.proyectoId) {
        router.push(`/proyectos/${data.proyectoId}`)
      }
    })

    return () => {
      cancelado = true
      listenerRespuesta.remove()
    }
  }, [activo, router])
}
