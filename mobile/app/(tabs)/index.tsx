import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../../lib/supabase'

export default function HomeScreen() {
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert(
        'Error',
        'No se pudo cerrar la sesión'
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Plann-It
        </Text>

        <Text style={styles.subtitle}>
          Inicio
        </Text>

        <Text style={styles.text}>
          Aquí aparecerán tus proyectos.
        </Text>

        <Pressable
          style={styles.button}
          onPress={cerrarSesion}
        >
          <Text style={styles.buttonText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 24,
    fontWeight: '600',
  },

  text: {
    fontSize: 16,
  },

  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})