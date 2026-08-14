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
  const [confirmacionPassword, setConfirmacionPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function registrarse() {
    const nombreLimpio = nombre.trim()
    const correoLimpio = correo.trim().toLowerCase()

    if (
      !nombreLimpio
      || !correoLimpio
      || !password
      || !confirmacionPassword
    ) {
      Alert.alert(
        'Error',
        'Completa todos los campos'
      )
      return
    }

    if (password !== confirmacionPassword) {
      Alert.alert(
        'Las contraseñas no coinciden',
        'Revisa ambos campos e intenta nuevamente.'
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

        <View style={styles.field}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            accessibilityLabel="Nombre de usuario"
            style={styles.input}
            placeholder="Cómo quieres que te llamemos"
            placeholderTextColor="#8A918B"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            textContentType="name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            accessibilityLabel="Correo electrónico"
            style={styles.input}
            placeholder="nombre@correo.com"
            placeholderTextColor="#8A918B"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            accessibilityLabel="Contraseña"
            style={styles.input}
            placeholder="Crea una contraseña"
            placeholderTextColor="#8A918B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            accessibilityLabel="Confirmar contraseña"
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#8A918B"
            value={confirmacionPassword}
            onChangeText={setConfirmacionPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={() => void registrarse()}
          />
        </View>

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
    backgroundColor: '#F8F5FB',
  },

  form: {
    gap: 16,
  },

  title: {
    color: '#342247',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  field: {
    gap: 7,
  },

  label: {
    color: '#4F2D7F',
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    padding: 14,
    color: '#342247',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },

  button: {
    backgroundColor: '#FF6B2C',
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
    color: '#6F45A5',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
})
