import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { ProyectoCard } from '../../features/proyectos/components/ProyectoCard'
import { useProyectos } from '../../features/proyectos/hooks/useProyectos'

export default function ProyectosScreen() {
  const {
    proyectos,
    cargando,
    error,
  } = useProyectos()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Mis proyectos
      </Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text>{error}</Text>
      ) : proyectos.length === 0 ? (
        <Text>
          Todavía no tienes proyectos.
        </Text>
      ) : (
        <View style={styles.lista}>
          {proyectos.map((proyecto) => (
            <ProyectoCard
              key={proyecto.proyecto_id}
              proyecto={proyecto}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  lista: {
    gap: 16,
  },
})