import { Ionicons } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { useCerrarSesion } from '../../features/auth/hooks/useCerrarSesion'

export default function TabLayout() {
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
headerRight: () => (
          // Contenedor principal que pone todo en fila
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            
            {/* NUESTRO NUEVO BOTÓN DE PERFIL */}
            <Pressable
              accessibilityLabel="Mi Perfil"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push('/perfil')}
              style={({ pressed }) => [
                styles.logoutButton, // Usamos el mismo estilo base para que sean consistentes
                pressed && styles.logoutButtonPressed,
                { marginRight: 10 } // Espacio entre el ícono de perfil y el de salir
              ]}
            >
              <Ionicons name="person-circle-outline" size={26} color="#166534" />
            </Pressable>

            {/* EL BOTÓN ORIGINAL DE SALIR (Intacto) */}
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
                <ActivityIndicator size="small" color="#842318" />
              ) : (
                <Ionicons name="log-out-outline" size={26} color="#842318" />
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
        }}
      />

      <Tabs.Screen
        name="proyectos"
        options={{
          title: 'Proyectos',
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
