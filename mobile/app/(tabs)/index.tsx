import { Ionicons } from '@expo/vector-icons'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppColors } from '../../constants/theme'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandIcon}>
        <Ionicons name="people-outline" size={34} color={AppColors.brand} />
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
    backgroundColor: AppColors.background,
  },
  brandIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.brandSoft,
  },
  title: {
    color: AppColors.brand,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
})
