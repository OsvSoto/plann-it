import { useState } from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function iniciarSesion() {
  if (!correo || !password) {
    Alert.alert(
      'Error',
      'Ingresa correo y contraseña'
    )
    return
  }

  try {
    setCargando(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: correo.trim().toLowerCase(),
        password,
      })

    if (error) {
      Alert.alert(
        'Error al iniciar sesión',
        error.message
      )
      return
    }

    console.log(
      'Sesión iniciada:',
      data.user.email
    )

    // NO hacemos router.replace().
    // RootLayout detecta la nueva sesión.
  } catch (error) {
    console.error(
      'Error inesperado en login:',
      error
    )

    Alert.alert(
      'Error',
      'Ocurrió un error inesperado'
    )
  } finally {
    setCargando(false)
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Plann-It</Text>
        <Text style={styles.subtitle}>Iniciar sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={styles.button}
          onPress={iniciarSesion}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Text>
        </Pressable>

        <Link href="/(auth)/register" style={styles.link}>
          Crear una cuenta
        </Link>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  form: {
    gap: 16,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  link: {
    textAlign: 'center',
    marginTop: 12,
  },
})