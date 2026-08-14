import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandIcon}>
        <Ionicons name="people-outline" size={34} color="#6F45A5" />
      </View>
      <Text style={styles.title}>Plann-It</Text>
      <Text style={styles.subtitle}>Bienvenido a tu espacio de trabajo</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: '#F8F5FB',
  },
  brandIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E9E1F3',
  },

  title: {
    color: '#6F45A5',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#766682',
    fontSize: 15,
    textAlign: 'center',
  },
})
