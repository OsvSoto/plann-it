import { Link } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Plann-It</Text>

      <Link href="/(auth)/register">
        Crear usuario
      </Link>

      <Link href="/(auth)/login">
        Iniciar sesión
      </Link>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})