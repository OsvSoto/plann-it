import type {
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ChatGlobal } from '../features/chat/components/ChatGlobal'
import { ChatProvider } from '../features/chat/context/ChatContext'
import { usePushNotifications } from '../features/notificaciones/hooks/usePushNotifications'
import { supabase } from '../lib/supabase'
import { useAppColors } from '../hooks/use-app-colors'
import type { AppColorsShape } from '../constants/theme'

export default function RootLayout() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarSesion() {
      const { data, error } =
        await supabase.auth.getSession()
      if (error) {
        console.error(
          'Error recuperando sesi n:',
          error.message
        )
      }
      setSession(data.session)
      setCargando(false)
    }
    cargarSesion()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (
        _event: AuthChangeEvent,
        nuevaSession: Session | null
      ) => {
        setSession(nuevaSession)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (cargando) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(perfil)" />
          <Stack.Screen
            name="proyectos/crear"
            options={{
              headerShown: true,
              title: 'Nuevo proyecto',
              headerBackTitle: 'Proyectos',
            }}
          />
          <Stack.Screen
            name="proyectos/[proyectoId]"
            options={{
              headerShown: true,
              title: 'Detalle del proyecto',
              headerBackTitle: 'Proyectos',
            }}
          />
          <Stack.Screen
            name="proyectos/[proyectoId]/analisis"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="proyectos/[proyectoId]/tableros/[tableroId]"
            options={{
              headerShown: true,
              title: 'Tablero',
              headerBackTitle: 'Proyecto',
            }}
          />
        </Stack.Protected>
      </Stack>

      {!!session && (
        <ChatProvider>
          <ChatGlobal />
          <PushNotificationsBridge />
        </ChatProvider>
      )}
    </GestureHandlerRootView>
  )
}

function PushNotificationsBridge() {
  usePushNotifications(true)
  return null
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
}