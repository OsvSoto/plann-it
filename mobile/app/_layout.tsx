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
import { ChatGlobal } from '../features/chat/components/ChatGlobal'
import { ChatProvider } from '../features/chat/context/ChatContext'
import { supabase } from '../lib/supabase'

export default function RootLayout() {
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#342247',
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
        </ChatProvider>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})