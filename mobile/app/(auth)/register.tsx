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

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function registrarse() {
    if (!nombre || !correo || !password) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }

    try {
      setCargando(true)

      const { data, error } = await supabase.auth.signUp({
        email: correo.trim(),
        password,
        options: {
          data: {
            usuario_nombre: nombre.trim(),
          },
        },
      })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }

      console.log('Usuario creado:', data.user)

      Alert.alert(
        'Registro correcto',
        'Usuario registrado correctamente'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />

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
          onPress={registrarse}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" style={styles.link}>
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

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  link: {
    textAlign: 'center',
    marginTop: 12,
  },
})