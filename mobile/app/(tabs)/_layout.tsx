import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
} from 'react-native'

import { useCerrarSesion } from '../../features/auth/hooks/useCerrarSesion'

export default function TabLayout() {
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
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#342247',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarActiveTintColor: '#6F45A5',
        tabBarInactiveTintColor: '#766682',
        tabBarStyle: {
          borderTopColor: '#D9CEE8',
          backgroundColor: '#FFFFFF',
        },
        headerRight: () => (
          <Pressable
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
            disabled={cerrandoSesion}
            hitSlop={8}
            onPress={confirmarCierreDeSesion}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
              cerrandoSesion && styles.logoutButtonDisabled,
            ]}
          >
            {cerrandoSesion ? (
              <ActivityIndicator size="small" color="#B42318" />
            ) : (
              <Ionicons name="log-out-outline" size={23} color="#B42318" />
            )}
          </Pressable>
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

const styles = StyleSheet.create({
  logoutButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#FEF3F2',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
})
