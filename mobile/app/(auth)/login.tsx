import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.title}>Plann-It</Text>
            <Text style={styles.subtitle}>Iniciar sesión</Text>

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
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#8A918B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
              />
            </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FB',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  form: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: 16,
  },

  title: {
    color: '#6F45A5',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#342247',
    fontSize: 22,
    textAlign: 'center',
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
