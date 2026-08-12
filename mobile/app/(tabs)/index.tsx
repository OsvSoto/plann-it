import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'

export default function HomeScreen() {
  const [mensaje, setMensaje] = useState('Probando conexión...')

  useEffect(() => {
    async function probarSupabase() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.log('ERROR:', error)
        setMensaje(`Error: ${error.message}`)
        return
      }

      console.log('Supabase funcionando')
      console.log(data)

      setMensaje('Conexión con Supabase correcta')
    }

    probarSupabase()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Text>{mensaje}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})