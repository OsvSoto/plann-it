import { Ionicons } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { useAppColors } from '../../hooks/use-app-colors'
import type { AppColorsShape } from '../../constants/theme'
import { useCerrarSesion } from '../../features/auth/hooks/useCerrarSesion'

export default function TabLayout() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const router = useRouter()
  const { cerrandoSesion, cerrarSesion } = useCerrarSesion()

  function confirmarCierreDeSesion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Quieres cerrar tu sesión en Plann-It?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void ejecutarCierreDeSesion()
          },
        },
      ]
    )
  }

  async function ejecutarCierreDeSesion() {
    try {
      await cerrarSesion()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      Alert.alert(
        'No fue posible cerrar sesión',
        'Intenta nuevamente.'
      )
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        headerRight: () => (
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Abrir mi perfil"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push('/(perfil)/perfil')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={25}
                color={colors.brand}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="Cerrar sesión"
              accessibilityRole="button"
              disabled={cerrandoSesion}
              hitSlop={8}
              onPress={confirmarCierreDeSesion}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.logoutButtonPressed,
                cerrandoSesion && styles.headerButtonDisabled,
              ]}
            >
              {cerrandoSesion ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={23}
                  color={colors.danger}
                />
              )}
            </Pressable>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="proyectos"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="invitaciones"
        options={{
          title: 'Invitaciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  profileButtonPressed: {
    backgroundColor: colors.brandSoft,
  },
  logoutButtonPressed: {
    backgroundColor: colors.dangerSoft,
  },
  headerButtonDisabled: {
    opacity: 0.6,
  },
  })
}
