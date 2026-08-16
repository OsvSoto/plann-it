import { Ionicons } from '@expo/vector-icons'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../hooks/use-app-colors'
import type { AppColorsShape } from '../../constants/theme'

export default function HomeScreen() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandIcon}>
        <Ionicons name="people-outline" size={34} color={colors.brand} />
      </View>
      <Text style={styles.title}>Plann-It</Text>
      <Text style={styles.subtitle}>Bienvenido a tu espacio de trabajo</Text>
    </SafeAreaView>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      padding: 24,
      backgroundColor: colors.background,
    },
    brandIcon: {
      width: 72,
      height: 72,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.brandSoft,
    },
    title: {
      color: colors.brand,
      fontSize: 32,
      fontWeight: 'bold',
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 15,
      textAlign: 'center',
    },
  })
}
