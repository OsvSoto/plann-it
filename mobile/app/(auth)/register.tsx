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
import { Link, router } from 'expo-router'

import { supabase } from '../../lib/supabase'

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function registrarse() {
    const nombreLimpio = nombre.trim()
    const correoLimpio = correo.trim().toLowerCase()

    if (!nombreLimpio || !correoLimpio || !password) {
      Alert.alert(
        'Error',
        'Completa todos los campos'
      )
      return
    }

    try {
      setCargando(true)

      const { data, error } = await supabase.auth.signUp({
        email: correoLimpio,
        password,
        options: {
          data: {
            usuario_nombre: nombreLimpio,
          },
        },
      })

      if (error) {
        Alert.alert(
          'Error al registrarse',
          error.message
        )
        return
      }

      if (!data.user) {
        Alert.alert(
          'Error',
          'No fue posible crear el usuario'
        )
        return
      }

      console.log('Usuario creado:', data.user.id)
      console.log('Correo:', data.user.email)

      if (!data.session) {
        Alert.alert(
          'Confirma tu correo',
          'Tu cuenta fue creada. Revisa tu correo electrónico para confirmarla antes de iniciar sesión.',
          [
            {
              text: 'Aceptar',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        )

        return
      }

      router.replace('/(tabs)')
    } catch (error) {
      console.error('Error inesperado al registrar usuario:', error)

      Alert.alert(
        'Error',
        'Ocurrió un error inesperado al crear la cuenta'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          Crear cuenta
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={[
            styles.button,
            cargando && styles.buttonDisabled,
          ]}
          onPress={registrarse}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>
            {cargando
              ? 'Registrando...'
              : 'Registrarse'}
          </Text>
        </Pressable>

        <Link
          href="/(auth)/login"
          style={styles.link}
        >
          Ya tengo una cuenta
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
    fontSize: 30,
    fontWeight: 'bold',
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

  buttonDisabled: {
    opacity: 0.5,
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